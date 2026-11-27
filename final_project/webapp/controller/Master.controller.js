sap.ui.define([
    "axalimoduli/controller/Base.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (BaseController, Filter, FilterOperator) => {
    "use strict";

    return BaseController.extend("axalimoduli.controller.Master", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("master").attachPatternMatched(this._onMasterMatched, this);
            oRouter.getRoute("product").attachPatternMatched(this._onDetailMatched, this);
            oRouter.getRoute("createProduct").attachPatternMatched(this._onCreateMatched, this);
        },

        formatListItemInfo(sPrice, iRating) {
            const sFormattedPrice = sPrice !== undefined && sPrice !== null
                ? Number.parseFloat(sPrice).toFixed(2)
                : "";
            const sRating = iRating !== undefined && iRating !== null ? String(iRating) : "";
            return sFormattedPrice && sRating ? `${sFormattedPrice} · ★ ${sRating}` : sFormattedPrice || sRating;
        },

        _onMasterMatched() {
            this.byId("masterList").removeSelections(true);
        },

        _onDetailMatched(oEvent) {
            this._selectProductById(oEvent.getParameter("arguments").ProductID);
        },

        _onCreateMatched() {
            this.byId("masterList").removeSelections(true);
        },

        _selectProductById(sProductId) {
            const oList = this.byId("masterList");
            oList.removeSelections(true);

            const oItem = oList.getItems().find((oListItem) => {
                const oContext = oListItem.getBindingContext("oDataV2Model");
                return oContext && String(oContext.getProperty("ID")) === String(sProductId);
            });

            if (oItem) {
                oList.setSelectedItem(oItem, true);
            }
        },

        onSearch(oEvent) {
            const sQuery = oEvent.getParameter("newValue").trim();
            const oBinding = this.byId("masterList").getBinding("items");

            if (!sQuery) {
                oBinding.filter([]);
                return;
            }

            const iNumericQuery = Number.parseInt(sQuery, 10);
            const aFilters = [
                new Filter("Name", FilterOperator.Contains, sQuery),
                new Filter("Description", FilterOperator.Contains, sQuery)
            ];

            if (!Number.isNaN(iNumericQuery)) {
                aFilters.push(new Filter("ID", FilterOperator.EQ, iNumericQuery));
            }

            oBinding.filter(new Filter({ filters: aFilters, and: false }));
        },

        onCreateProduct() {
            this.getOwnerComponent().getRouter().navTo("createProduct");
        },

        onProductSelected(oEvent) {
            const oListItem = oEvent.getParameter("listItem");
            if (!oListItem) {
                return;
            }

            const oContext = oListItem.getBindingContext("oDataV2Model");
            if (!oContext) {
                return;
            }

            this.getOwnerComponent().getRouter().navTo("product", {
                ProductID: oContext.getProperty("ID")
            });
        }
    });
});
