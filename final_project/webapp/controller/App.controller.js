sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("axalimoduli.controller.App", {
        onInit() {
            const oComponent = this.getOwnerComponent();
            this.oRouter = oComponent.getRouter();

            this.getView().setModel(oComponent.getModel("layout"), "layout");
        },

        onStateChanged(oEvent) {
            if (oEvent.getParameter("isNavigationArrow")) {
                this.oRouter.navTo("master");
            }
        }
    });
});
