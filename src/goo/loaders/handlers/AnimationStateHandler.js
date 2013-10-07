define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/animation/layer/AnimationLayer',
	'goo/animation/layer/LayerLERPBlender',
	'goo/animation/state/SteadyState',
	'goo/animation/blendtree/ClipSource',
	'goo/animation/blendtree/ManagedTransformSource',
	'goo/animation/blendtree/BinaryLERPSource',
	'goo/animation/blendtree/FrozenClipSource',
	'goo/animation/state/FadeTransitionState',
	'goo/animation/state/SyncFadeTransitionState',
	'goo/animation/state/FrozenTransitionState',
	'goo/util/rsvp',
	'goo/util/PromiseUtil'
], function(
	ConfigHandler,
	AnimationLayer,   /* REVIEW: AnimationLayer does not appear to be used here? */
	LayerLERPBlender, /* REVIEW: LayerLERPBlender does not appear to be used either? */
	SteadyState,
	ClipSource,
	ManagedTransformSource,
	BinaryLERPSource,
	FrozenClipSource,
	FadeTransitionState,      /* REVIEW: Neither does FadeTransitionState appear to be used? */
	SyncFadeTransitionState,  /* REVIEW: Nor SyncFadeTransitionState? */
	FrozenTransitionState,    /* REVIEW: Or FrozenTransitionState? */
	RSVP,
	PromiseUtil
) {

	function AnimationStateHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}
	AnimationStateHandler.prototype = Object.create(ConfigHandler);
	AnimationStateHandler.prototype.construcor = AnimationStateHandler;
	ConfigHandler._registerClass('animstate', AnimationStateHandler);

	AnimationStateHandler.prototype.update = function(ref, config) {
		var object = this._objects[ref] || this._create(ref);
		object.name = config.name;
		return this._parseClipSource(config.clipSource, object._sourceTree).then(function(source) {
			object._sourceTree = source;
			return object;
		});
	};

	AnimationStateHandler.prototype._create = function(ref) {
		return this._objects[ref] = new SteadyState();
	};

	AnimationStateHandler.prototype._parseClipSource = function(cfg, clipSource) {
		//var promises, source;
		var that = this;

		switch (cfg.type) {
			case 'Clip':
				return this.getConfig(cfg.clipRef).then(function(config) {
					return that.updateObject(cfg.clipRef, config, that.options).then(function(clip) {
						if(!clipSource || (!clipSource instanceof ClipSource)) {
							clipSource = new ClipSource(clip, cfg.filter, cfg.channels);
						} else {
							clipSource._clip = clip;
							clipSource.setFilter(cfg.filter, cfg.channels);
						}

						if (cfg.loopCount) {
							clipSource._clipInstance._loopCount = +cfg.loopCount;
						}
						if (cfg.timeScale) {
							clipSource._clipInstance._timeScale = cfg.timeScale;
						}

						return clipSource;
					});
				});
			case 'Managed':
				if(!clipSource || (!clipSource instanceof ManagedTransformSource)) {
					clipSource = new ManagedTransformSource();
				}
				var source = clipSource;
				if (cfg.clipRef) {
					return this.getConfig(cfg.clipRef).then(function(config) {
						return that.updateObject(cfg.clipRef, config, that.options);
					}).then(function(clip) {
						return source.initFromClip(clip, cfg.filter, cfg.channels);
					});
				} else {
					return PromiseUtil.createDummyPromise(source);
				}
				break;
			case 'Lerp':
				var promises = [this._parseClipSource(cfg.clipSourceA), this._parseClipSource(cfg.clipSourceB)];
				return RSVP.all(promises).then(function(clipSources) {
					var source = new BinaryLERPSource(clipSources[0], clipSources[1]);
					if (cfg.blendWeight) {
						source.blendWeight = cfg.blendWeight;
					}
					return source;
				});
			case 'Frozen':
				return this._parseClipSource(cfg.clipSource).then(function(subClipSource) {
					if (!clipSource || !(clipSource instanceof FrozenClipSource)) {
						clipSource = new FrozenClipSource(subClipSource, cfg.frozenTime || 0.0);
					} else {
						clipSource._source = subClipSource;
						clipSource._time = cfg.frozenTime || 0.0;
					}
					return clipSource;
				});
			default:
				console.error('Unable to parse clip source');
				return PromiseUtil.createDummyPromise();
		}
	};

	return AnimationStateHandler;
});