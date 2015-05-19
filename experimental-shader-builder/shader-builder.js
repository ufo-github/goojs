(function () {
	'use strict';

	/**
	 * Perform a topological sort of a graph
	 * @param graph
	 * @returns {Array} Ordered nodes
	 */
	function sort(graph) {
		var unvisited = new Set(graph.keys());
		var visited = new Set();
		var order = [];

		function df(nodeId) {
			if (visited.has(nodeId)) {
				return;
			}

			visited.add(nodeId);
			unvisited.delete(nodeId);

			graph.get(nodeId).outputsTo.filter(function (output) {
				return output.to !== '_';
			}).forEach(function (output) {
				df(output.to);
			});

			order.push(graph.get(nodeId));
		}

		while (unvisited.size) {
			df(unvisited.values().next().value);
		}

		return order;
	}

	// just converts a structure (array) to a map (id -> node)
	function toGraph(structure) {
		var graph = new Map();

		structure.forEach(function (node) {
			graph.set(node.id, node);
		});

		return graph;
	}

	/**
	 * Generate code given node types and an array of sorted nodes
	 * @param nodeTypes
	 * @param nodes
	 * @returns {string}
	 */
	function generateCode(nodeTypes, nodes) {
		function getInputVar(nodeId, varName) {
			return 'inp_' + nodeId + '_' + varName;
		}

		var stringifiedExternals = nodes.filter(function (node) {
			return node.type === 'external';
		}).map(function (node) {
			return node.inputType + ' ' + node.dataType + ' ' + node.externalName + ';';
		}).join('\n');

		// declare the inputs of all nodes
		var copyIn = nodes.map(function (node) {
			var nodeDefinition = nodeTypes[node.type];

			return '// node ' + node.id + '\n' +
				nodeDefinition.inputs.map(function (input) {
					return input.type + ' ' + getInputVar(node.id, input.name) + ';';
				}).join('\n');
		}).join('\n');

		var stringifiedNodes = nodes.map(function (node) {
			var nodeDefinition = nodeTypes[node.type];


			// declare outputs of the node
			var outputDeclarations;
			if (nodeDefinition.outputs) {
				outputDeclarations = nodeDefinition.outputs.map(function (output) {
					return '\t' + output.type + ' ' + output.name + ';';
				}).join('\n');
			} else {
				outputDeclarations = '';
			}


			// copy the outputs of this node to the inputs of the next node
			var copyOut = node.outputsTo.map(function (outputTo) {
				return '\t' + getInputVar(outputTo.to, outputTo.input) +
					' = ' + outputTo.output + ';';
			}).join('\n');


			// body
			var bodyCode;
			if (node.type === 'external') {
				// just alias the external for now
				bodyCode = nodeDefinition.outputs[0].type + ' ' +
					nodeDefinition.outputs[0].name + ' = ' + node.externalName + ';';
			} else {
				var bodyGenerator = jsTemplate.getCodeGenerator(node.type, nodeDefinition.body);

				// have global and local defines (local ones shadow global ones)
				bodyCode = bodyGenerator(node.defines);
			}


			// process inputs (from other shader's outputs)
			var processedBody = nodeDefinition.inputs.reduce(function (partial, input) {
				// should do a tokenization of the shader coder instead
				// this regex will fail for comments, strings
				return partial.replace(
					new RegExp('\\b' + input.name + '\\b', 'g'),
					getInputVar(node.id, input.name)
				);
			}, bodyCode);


			// put everything together
			return '// node ' + node.id + ', ' + node.type + '\n' +
				'{\n' +
				outputDeclarations + '\n' +
				'\t' + processedBody + '\n'
				+ copyOut +
				'\n}\n';
		}).join('\n');

		return stringifiedExternals + '\n\nvoid main(void) {\n' +
			copyIn + '\n' +
			stringifiedNodes + '\n' +
			'}';
	}

	/**
	 * Generate code given node types and the graph-like structure of nodes
	 * @param types
	 * @param structure
	 * @returns {string}
	 */
	function buildShader(types, structure) {
		var graph = toGraph(structure);
		var sorted = sort(graph);
		sorted.reverse(); // easier to reverse this than to invert the graph
		return generateCode(types, sorted);
	}

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.buildShader = buildShader;
})();