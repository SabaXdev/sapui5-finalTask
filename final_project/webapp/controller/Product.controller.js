sap.ui.define([
    "axalimoduli/controller/Base.controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/ui/model/json/JSONModel"
], (BaseController, MessageBox, MessageToast, ValueState, JSONModel) => {
    "use strict";

    const EDIT_FIELD_IDS = [
        "productInputId",
        "productInputName",
        "productInputDescription",
        "productInputReleaseDate",
        "productInputRating",
        "productInputPrice"
    ];

    return BaseController.extend("axalimoduli.controller.Product", {
        onInit() {
            this._oRouter = this.getOwnerComponent().getRouter();
            this.getView().setModel(this.getOwnerComponent().getModel("oDataV2Model"));
            this.getView().setModel(new JSONModel({
                editMode: false,
                createMode: false,
                pageTitle: ""
            }), "view");

            this._oRouter.getRoute("product").attachPatternMatched(this._onProductMatched, this);
            this._oRouter.getRoute("createProduct").attachPatternMatched(this._onCreateMatched, this);
        },

        onExit() {
            this._oRouter.getRoute("product").detachPatternMatched(this._onProductMatched, this);
            this._oRouter.getRoute("createProduct").detachPatternMatched(this._onCreateMatched, this);
        },

        _getViewModel() {
            return this.getView().getModel("view");
        },

        _setViewState(bEditMode, bCreateMode) {
            const oViewModel = this._getViewModel();
            oViewModel.setProperty("/editMode", bEditMode);
            oViewModel.setProperty("/createMode", bCreateMode);
            oViewModel.setProperty("/pageTitle", this._getText(bCreateMode ? "createProductTitle" : "productPageTitle"));
        },

        _onProductMatched(oEvent) {
            const sProductId = oEvent.getParameter("arguments").ProductID;

            this.getView().bindElement({
                path: `/Products(${sProductId})`,
                parameters: {
                    expand: "Supplier"
                },
                events: {
                    change: () => {
                        if (!this.getView().getBindingContext()) {
                            MessageBox.error(this._getText("productNotFound"));
                            this._oRouter.navTo("master");
                        }
                    }
                }
            });

            this._setViewState(false, false);
            this._clearFieldValueStates();
        },

        _onCreateMatched() {
            const oModel = this.getView().getModel();
            const oContext = oModel.createEntry("/Products", {
                properties: {
                    Name: "",
                    Description: "",
                    Rating: 0,
                    Price: "0.00"
                }
            });

            this.getView().setBindingContext(oContext);
            this._setViewState(true, true);
            this._clearFieldValueStates();
        },

        _getText(sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        _clearFieldValueStates() {
            EDIT_FIELD_IDS.forEach((sId) => {
                const oControl = this.byId(sId);
                if (oControl) {
                    oControl.setValueState(ValueState.None);
                    oControl.setValueStateText("");
                }
            });
        },

        _isFieldEmpty(oControl) {
            if (oControl.isA("sap.m.DatePicker")) {
                return !oControl.getDateValue();
            }

            const vValue = oControl.getValue();
            return vValue === undefined || vValue === null || String(vValue).trim() === "";
        },

        _setFieldValueState(oControl, bValid) {
            if (bValid) {
                oControl.setValueState(ValueState.None);
                oControl.setValueStateText("");
                return;
            }

            oControl.setValueState(ValueState.Error);
            oControl.setValueStateText(this._getText("addProductFieldRequired"));
        },

        _validateForm() {
            const bCreateMode = this._getViewModel().getProperty("/createMode");
            const aRequiredIds = bCreateMode
                ? EDIT_FIELD_IDS
                : EDIT_FIELD_IDS.filter((sId) => sId !== "productInputId");

            let bValid = true;

            aRequiredIds.forEach((sId) => {
                const oControl = this.byId(sId);
                if (!oControl) {
                    return;
                }

                const bFieldValid = !this._isFieldEmpty(oControl);
                this._setFieldValueState(oControl, bFieldValid);
                if (!bFieldValid) {
                    bValid = false;
                }
            });

            return bValid;
        },

        onFieldChange(oEvent) {
            const oControl = oEvent.getSource();
            if (!this._isFieldEmpty(oControl)) {
                this._setFieldValueState(oControl, true);
            }
        },

        onEdit() {
            this._setViewState(true, false);
            this._clearFieldValueStates();
        },

        onSave() {
            if (!this._validateForm()) {
                return;
            }

            const oModel = this.getView().getModel();
            const oContext = this.getView().getBindingContext();
            const bCreateMode = this._getViewModel().getProperty("/createMode");

            oModel.submitChanges({
                success: () => {
                    MessageToast.show(this._getText(bCreateMode ? "createProductsSuccess" : "updateProductsSuccess"));

                    if (bCreateMode) {
                        const sNewId = oContext.getProperty("ID");
                        this._oRouter.navTo("product", {
                            ProductID: sNewId
                        }, true);
                        return;
                    }

                    this._setViewState(false, false);
                },
                error: (oError) => {
                    const sMessage = oError?.message || this._getText(bCreateMode ? "createProductsFailed" : "updateProductsFailed");
                    MessageBox.error(sMessage);
                }
            });
        },

        onCancel() {
            const oModel = this.getView().getModel();
            const bCreateMode = this._getViewModel().getProperty("/createMode");

            if (bCreateMode) {
                const oContext = this.getView().getBindingContext();
                if (oContext) {
                    oModel.deleteCreatedEntry(oContext);
                }
                this._oRouter.navTo("master");
                return;
            }

            oModel.resetChanges();
            this._setViewState(false, false);
            this._clearFieldValueStates();
        },

        onDelete() {
            const oContext = this.getView().getBindingContext();
            if (!oContext) {
                return;
            }

            MessageBox.confirm(this._getText("deleteProductConfirm"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: (sAction) => {
                    if (sAction !== MessageBox.Action.OK) {
                        return;
                    }

                    const oModel = this.getView().getModel();
                    oModel.remove(oContext.getPath(), {
                        success: () => {
                            MessageToast.show(this._getText("deleteProductSuccess"));
                            this._oRouter.navTo("master");
                        },
                        error: (oError) => {
                            const sMessage = oError?.message || this._getText("deleteProductsFailed");
                            MessageBox.error(sMessage);
                        }
                    });
                }
            });
        },

        onNavBack() {
            if (this._getViewModel().getProperty("/createMode")) {
                this.onCancel();
                return;
            }

            if (this._getViewModel().getProperty("/editMode")) {
                this.onCancel();
                return;
            }

            this._oRouter.navTo("master");
        }
    });
});
