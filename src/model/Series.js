define(function(require) {

    'use strict';

    var zrUtil = require('zrender/core/util');
    var formatUtil = require('../util/format');
    var ComponentModel = require('./Component');

    var encodeHTML = formatUtil.encodeHTML;
    var addCommas = formatUtil.addCommas;

    var SeriesModel = ComponentModel.extend({

        type: '',

        /**
         * @readOnly
         */
        seriesIndex: 0,

        /**
         * @readOnly
         */
        name: '',

        // coodinateSystem will be injected in the echarts/CoordinateSystem
        coordinateSystem: null,

        /**
         * @type {Object}
         * @protected
         */
        defaultOption: null,

        init: function (option, parentModel, ecModel, dependentModels, seriesIndex) {
            /**
             * @type {number}
             */
            this.seriesIndex = seriesIndex;

            this.mergeDefaultAndTheme(option, ecModel);

            var seriesName = this.get('name');
            if (seriesName == null) {
                seriesName = this.get('type') + '' + seriesIndex;
            }
            this.name += seriesName + '';

            /**
             * @type {module:echarts/data/List|module:echarts/data/Tree|module:echarts/data/Graph}
             * @private
             */
            this._data = this.getInitialData(option, ecModel);

            this._dataBeforeProcessing = this._data.cloneShallow();

            this._itemVisuals = [];
            this._itemLayouts = [];
        },

        mergeDefaultAndTheme: function (option, ecModel) {
            zrUtil.merge(
                option,
                ecModel.getTheme().get(ComponentModel.parseComponentType(this.type).sub)
            );
            zrUtil.merge(option, this.getDefaultOption());
        },

        mergeOption: function (newSeriesOption, ecModel) {
            var data = this.getInitialData(newSeriesOption, ecModel);
            // TODO Merge data?
            if (data) {
                this._data = data;
            }
        },

        /**
         * Init a data structure from data related option in series
         * Must be overwritten
         */
        getInitialData: function () {},

        /**
         * @return {module:echarts/data/List|module:echarts/data/Graph|module:echarts/data/Tree}
         */
        getData: function () {
            return this._data;
        },

        // FIXME
        /**
         * Default tooltip formatter
         *
         * @param {number} dataIndex
         * @param {boolean} [mutipleSeries=false]
         */
        formatTooltip: function (dataIndex, mutipleSeries) {
            var data = this._data;
            var value = data.getRawValue(dataIndex);
            var formattedValue = zrUtil.isArray(value)
                ? zrUtil.map(value, addCommas) : addCommas(value);
            var name = data.getName(dataIndex);

            return !mutipleSeries ? (encodeHTML(this.name) + '<br />'
                + encodeHTML(name) + ' : ' + formattedValue)
                : (encodeHTML(this.name) + ' : ' + formattedValue);
        },

        restoreData: function () {
            this._data = this._dataBeforeProcessing.cloneShallow();
        }
    });

    return SeriesModel;
});