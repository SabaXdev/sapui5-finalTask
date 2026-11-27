sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], (Controller, History) => {
    "use strict";

    return Controller.extend("axalimoduli.controller.Base", {
        /**
         * Convenience method for accessing the router in each controller.
         * @returns {sap.ui.core.routing.Router} The router for this component.
         */
        getRouter() {
            return this.getOwnerComponent().getRouter();
        },

        /**
         * Convenience method for getting the view model by name in each controller.
         * @param {string} [sName]
         * @returns {sap.ui.model.Model}
         */
        getModel(sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model in each controller.
         * @param {sap.ui.model.Model} oModel
         * @param {string} [sName]
         * @returns {sap.ui.core.mvc.Controller}
         */
        setModel(oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle text.
         * @param {string} sKey
         * @param {Array} [aArgs]
         * @returns {string}
         */
        getText(sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        /**
         * Returns the default JSON model (books catalog) bound to the view.
         * @returns {sap.ui.model.json.JSONModel}
         */
        getBooksModel() {
            return this.getView().getModel();
        },

        /**
         * Event handler for navigating back.
         * It checks the history and navigates back if possible,
         * or navigates to the default route.
         */
        onNavBack() {
            const sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("master", {}, true);
            }
        }
    });
});
