define(function () {
	'use strict';

	/**
	 * Wrapper for a node structure
	 * @constructor
	 */
	function Structure() {
		this.nodes = {};
		this._context = null;
	}

	/**
	 * Should be called only internally
	 * @hidden
	 * @param node
	 * @returns {Structure}
	 */
	Structure.prototype.addNode = function (node) {
		this.nodes[node.id] = node;
		return this;
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param node
	 * @returns {Structure}
	 */
	Structure.prototype.removeNode = function (node) {
		// remove connections to the node
		delete this.nodes[node.id];
		return this;
	};

	/**
	 * Propagates any * types that are resolved by the new connection
	 * @param startNode
	 * @param connection
	 * @private
	 */
	Structure.prototype._reflowTypes = function (startNode, connection) {
		var typeDefinitions = this._context.typeDefinitions;
		var nodes = this.nodes;

		function resolveType(node, inputType, resolvedType) {
			if (node.resolvedTypes.has(inputType)) {
				// throw exceptions on mismatch
				// same node may have the generic type already resolved by some other input
				var alreadyResolvedType = node.resolvedTypes.get(inputType);
				if (alreadyResolvedType.type !== resolvedType) {
					throw new Error(
						'could not match ' + resolvedType +
						' with already resolved generic type ' + inputType + ' of ' + alreadyResolvedType.type
					);
				} else {
					alreadyResolvedType.count++;
				}
			} else {
				node.resolvedTypes.set(inputType, {
					type: resolvedType,
					count: 1
				});
			}

			// propagate if there are outputs with the same generic type
			var outputs = typeDefinitions[node.type].outputs.filter(function (output) {
				return output.generic && output.type === inputType;
			}).map(function (output) {
				return output.name;
			});

			// and any connections starting from those inputs
			node.outputsTo.forEach(function (outputTo) {
				if (outputs.indexOf(outputTo.output) !== -1) {
					propagate(node, outputTo);
				}
			});
		}


		function propagate(startNode, connection) {
			var outputType;

			// relevant only the first time the function is called
			// no node can lead to an external node
			if (startNode.type === 'external-input') {
				outputType = startNode.external.dataType;
			} else {
				var outputDefinitions = typeDefinitions[startNode.type].outputs;
				var outputDefinition = _(outputDefinitions).find(function (output) {
					return output.name === connection.output;
				});

				if (outputDefinition.generic && startNode.resolvedTypes.has(outputDefinition.type)) {
					outputType = startNode.resolvedTypes.get(outputDefinition.type).type;
				} else if (!outputDefinition.generic) {
					outputType = outputDefinition.type;
				} else {
					// if the type if not fixed or resolved then there is nothing to propagate
					return;
				}
			}


			var targetNode = nodes[connection.to];
			var inputType;

			if (targetNode.type === 'external-output') {
				inputType = targetNode.external.dataType;
			} else {
				var inputsDefinition = typeDefinitions[targetNode.type].inputs;
				var inputDefinition = _(inputsDefinition).find(function (input) {
					return input.name === connection.input;
				});
				inputType = inputDefinition.type;
			}


			if (targetNode.type !== 'external-output' && inputDefinition.generic) {
				resolveType(targetNode, inputType, outputType);
			} else {
				if (outputType !== inputType) {
					throw new Error(
						'could not match type ' + outputType +
						' with type ' + inputType
					);
				}
			}
		}

		propagate(startNode, connection);
	};

	/**
	 * "Unresolves" any types that were resolved by this connection.
	 * This is applied recursively, to the whole structure.
	 * @private
	 * @param startNode
	 * @param connection
	 */
	Structure.prototype._unflowTypes = function (startNode, connection) {
		var typeDefinitions = this._context.typeDefinitions;
		var nodes = this.nodes;

		function unresolveType(node, inputType) {
			var entry = node.resolvedTypes.get(inputType);
			entry.count--;
			if (entry.count === 0) {
				node.resolvedTypes.delete(inputType);

				// propagate if there are outputs with the same generic type
				var outputs = typeDefinitions[node.type].outputs.filter(function (output) {
					return output.generic && output.type === inputType;
				}).map(function (output) {
					return output.name;
				});

				// and any connections starting from those inputs
				node.outputsTo.forEach(function (outputTo) {
					if (outputs.indexOf(outputTo.output) !== -1) {
						propagate(node, outputTo);
					}
				});
			}
		}

		function propagate(node, connection) {
			if (node.type !== 'external-input') {
				var outputDefinitions = typeDefinitions[startNode.type].outputs;
				var outputDefinition = _(outputDefinitions).find(function (output) {
					return output.name === connection.output;
				});
			}


			var targetNode = nodes[connection.to];
			var inputsDefinition = typeDefinitions[targetNode.type].inputs;
			var inputDefinition = _(inputsDefinition).find(function (input) {
				return input.name === connection.input;
			});


			// check ot see if there is any "unresolveness" that can be propagated
			if (
				(node.type === 'external-input' ||
					(!outputDefinition.generic || node.resolvedTypes.has(outputDefinition.type))) &&
				inputDefinition.generic &&
				targetNode.resolvedTypes.has(inputDefinition.type)
			) {
				unresolveType(targetNode, inputDefinition.type);
			}
		}

		propagate(startNode, connection);
	};

	/**
	 * Checks if connections from this node eventually arrive at itself
	 * @param startNode
	 * @param connection
	 * @returns {boolean}
	 * @private
	 */
	Structure.prototype._returnsTo = function (startNode, connection) {
		var visited = new Set();

		function df(node) {
			if (node === startNode) {
				return true;
			}

			if (visited.has(node)) {
				return false;
			} else {
				visited.add(node);
			}

			if (!node.outputsTo) { return false; }

			return node.outputsTo.map(function (outputTo) {
				return this.nodes[outputTo.to];
			}, this).some(df, this);
		}

		return df.call(this, this.nodes[connection.to]);
	};

	/**
	 * Returns whether a node accepts a connection. Should be called only internally.
	 * @param node
	 * @param connection
	 * @returns {{result: boolean, reason: string}}
	 */
	Structure.prototype.acceptsConnection = function (node, connection) {
		var targetNode = this.nodes[connection.to];

		if (targetNode.incomingConnections.has(connection.input)) {
			return {
				result: false,
				reason: 'input [' + connection.input + '] is already occupied'
			};
		}

		if (this._returnsTo(node, connection)) {
			return {
				result: false,
				reason: 'cannot have cycles'
			};
		}

		return {
			result: true
		};
	};

	/**
	 * Adds a connection to a node and performs validity checks. Should be called only internally
	 * @param node
	 * @param connection
	 * @returns {Structure}
	 */
	Structure.prototype.addConnection = function (node, connection) {
		// why proxy these operations?
		// because they can verify the validity of the graph
		// while the node alone cannot do that

		var accepts = this.acceptsConnection(node, connection);
		if (!accepts.result) {
			throw new Error(
				'could not connect [' + connection.output + '] to [' + connection.input + ']; ' +
				accepts.reason
			);
		}

		this._reflowTypes(node, connection);

		node.addConnection(connection);

		// occupy input
		var targetNode = this.nodes[connection.to];
		targetNode.incomingConnections.add(connection.input);

		return this;
	};

	/**
	 * Removes an existing connection. Should be called only internally
	 * @param node
	 * @param connection
	 * @returns {Structure}
	 */
	Structure.prototype.removeConnection = function (node, connection) {
		this._unflowTypes(node, connection);
		node.removeConnection(connection);
		return this;
	};

	Structure.prototype.toJson = function () {
		return Object.keys(this.nodes).map(function (key) {
			return this.nodes[key].toJson();
		}, this);
	};

	Structure.fromJson = function (json) {
		var structure = new Structure();
		Object.keys(json).map(function (key) {
			var nodeConfig = json[key];
			var node = (nodeConfig.type === 'external-input' ? ExternalInputNode : FunctionNode).fromJson(nodeConfig);
			structure.addNode(node);
		});
		return structure;
	};

	return Structure;
});