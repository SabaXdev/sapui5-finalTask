sap.ui.define([
    "sap/ui/core/UIComponent",
    "axalimoduli/model/models",
    "sap/f/library"
], (UIComponent, models, fioriLibrary) => {
    "use strict";

    return UIComponent.extend("axalimoduli.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(models.createDeviceModel(), "device");
            this.setModel(models.createLayoutModel(), "layout");

            const oRouter = this.getRouter();
            const LayoutType = fioriLibrary.LayoutType;

            oRouter.attachBeforeRouteMatched((oEvent) => {
                const sRouteName = oEvent.getParameter("name");
                const sLayout = sRouteName === "master"
                    ? LayoutType.OneColumn
                    : LayoutType.TwoColumnsBeginExpanded;

                this.getModel("layout").setProperty("/layout", sLayout);
            }, this);

            // enable routing
            oRouter.initialize();
        }
    });
});