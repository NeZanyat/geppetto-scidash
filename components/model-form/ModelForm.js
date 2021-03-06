/* eslint-disable react/no-unused-state */
import React from "react";
import Chip from "material-ui/Chip";
import SvgIcon from "material-ui/SvgIcon";
import MenuItem from "material-ui/MenuItem";
import TextField from "material-ui/TextField";
import SelectField from "material-ui/SelectField";
import RaisedButton from "material-ui/RaisedButton";
import CircularProgress from "material-ui/CircularProgress";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import { red400, brown500 } from "material-ui/styles/colors";
import { OKicon, Xicon } from "../../assets/CustomIcons";
import ModelClassApiService from "../../services/api/ModelClassApiService";
import FilteringService from "../../services/FilteringService";
import Config from "../../shared/Config";
import ModelParametersApiService from "../../services/api/ModelParametersApiService";
import ParamsTable from "./ParamsTable";
import ModelInstance from "../../models/ModelInstance";
import { ADDED, REMOVED } from "./events";

export default class ModelForm extends React.Component {
  constructor (props, context) {
    super(props, context);

    this.state = {
      params: [],
      stateVariables: [],
      modelClasses: [],
      model: props.model,
      loadingClasses: false,
      successClasses: false,
      failClasses: false,
      paramsErrors: [],
      loadingParams: false,
      successParams: false,
      paramsDisabled: true,
      newTag: "",
      modelParamsOpen: false,
      validationFailed: false,
      isBlocked: false,
      changesHappened: false
    };

    this.checkUrl = this.checkUrl.bind(this);
    this.saveChecked = this.saveChecked.bind(this);
    this.removeChecked = this.removeChecked.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.addAll = this.addAll.bind(this);
    this.updateModel = this.updateModel.bind(this);
    this.onSave = props.onSave.bind(this);
    this.onCancel = props.onCancel.bind(this);
    this.modelFactory = GEPPETTO.ModelFactory;
    this.deleteTag = this.deleteTag.bind(this);
    this.addTag = this.addTag.bind(this);
    this.isInstanceBlocked = this.isInstanceBlocked.bind(this);
    this.convertUrl = this.convertUrl.bind(this);
  }

  componentWillMount () {
    if (this.props.actionType === "edit") {
      this.checkUrl(this.state.model.url);
      this.isInstanceBlocked();
    }
  }

  componentDidUpdate () {
    if (this.props.actionType === "edit") {
      this.isInstanceBlocked();
    }
  }

  getModelClassError () {
    let errors = [];

    if (this.state.model.errors !== undefined) {
      errors.push(
        "model_class" in this.state.model.errors
          ? this.state.model.errors["model_class"]
          : ""
      );
    }
    errors.push(
      this.state.failClasses
        ? " / No compatible class found for this model"
        : ""
    );

    return errors;
  }

  async checkUrl (url) {
    this.setState({
      loadingClasses: true,
      successClasses: false,
      successParams: false,
      failClasses: false,
      paramsErrors: []
    });

    let classService = new ModelClassApiService();
    let paramsService = new ModelParametersApiService();
    let filteringService = FilteringService.getInstance();

    filteringService.setupFilter(
      "model_url",
      url,
      Config.modelCreateNamespace,
      false,
      false
    );

    let responseClasses = await classService.getList(
      false,
      Config.modelCreateNamespace
    );

    if (responseClasses.length > 0) {
      this.setState({
        successClasses: true
      });
    } else {
      this.setState({
        failClasses: true
      });
    }

    this.setState({
      loadingClasses: false,
      modelClasses: responseClasses,
      loadingParams: true
    });

    let responseParams = await paramsService.getList(
      false,
      Config.modelCreateNamespace
    );

    if (responseParams.failed) {
      this.setState({
        paramsErrors: [responseParams.message]
      });
      this.setState({
        loadingParams: false,
        successParams: false,
        paramsDisabled: true
      });
    } else {
      this.processModel(JSON.parse(responseParams.data));
      this.updateModel(
        { url: this.convertUrl(url) },
        () => {
          this.setState({
            loadingParams: false,
            successParams: true,
            paramsDisabled: false
          });
        },
        true
      );
    }
  }

  convertUrl (url) {
    if (
      url.toLowerCase().indexOf("githubusercontent") === -1 &&
      url.toLowerCase().indexOf("github") > -1
    ) {
      let string1 = url.slice(0, url.indexOf("/blob/"));
      let string2 = url.slice(url.indexOf("/blob/") + 5, url.length);
      let github_user = string1.slice(
        string1.slice(0, string1.lastIndexOf("/")).lastIndexOf("/") + 1,
        string1.lastIndexOf("/")
      );
      let repository = string1.slice(
        string1.lastIndexOf("/") + 1,
        string1.length
      );
      let final_string =
        "https://raw.githubusercontent.com/" +
        github_user +
        "/" +
        repository +
        string2;
      return final_string;
    } else {
      return url;
    }
  }

  deleteTag (tag) {
    let { model } = this.state;
    for (let i = 0; i < model.tags.length; i++) {
      if (model.tags[i] === tag) {
        model.tags.splice(i, 1);
      }
    }
    this.updateModel({ tags: [...model.tags] });
  }

  addTag (newTag) {
    if (!this.state.model.tags.includes(newTag)) {
      this.updateModel({ tags: [...this.state.model.tags, newTag] });
      this.setState({ newTag: "" });
    }
  }

  retrieveStateVariables () {
    this.setState({
      stateVariables: GEPPETTO.ModelFactory.getAllPotentialInstancesOfMetaType(
        "StateVariableType"
      )
    });
  }

  retrieveParams () {
    this.setState({
      params: GEPPETTO.ModelFactory.getAllPotentialInstancesOfMetaType(
        "ParameterType"
      )
    });
  }

  saveChecked (variable) {
    if (!this.state.model.run_params.watchedVariables.includes(variable)) {
      this.updateModel(
        {
          run_params: {
            ...this.state.model.run_params,
            watchedVariables: [
              ...this.state.model.run_params.watchedVariables,
              variable
            ]
          }
        },
        () => GEPPETTO.trigger(ADDED, variable)
      );
    }
  }

  removeChecked (variable) {
    this.updateModel(
      {
        run_params: {
          ...this.state.model.run_params,
          watchedVariables: this.state.model.run_params.watchedVariables.filter(
            el => el != variable
          )
        }
      },
      () => GEPPETTO.trigger(REMOVED, variable)
    );
  }

  removeAll () {
    this.updateModel({
      run_params: {
        ...this.state.model.run_params,
        watchedVariables: []
      }
    });
  }

  addAll () {
    this.updateModel({
      run_params: {
        ...this.state.model.run_params,
        watchedVariables: this.state.model.run_params.stateVariables
      }
    });
  }

  processModel (model) {
    GEPPETTO.Manager.loadModel(JSON.parse(model.geppetto_model_loaded));

    this.retrieveStateVariables();
    this.retrieveParams();

    this.updateModel(
      {
        run_params: {
          stateVariables: this.state.stateVariables,
          watchedVariables:
            this.state.model.id === null
              ? []
              : this.state.model.run_params.watchedVariables,
          params: this.state.params.map(value => {
            let object = eval(value);
            let sixDecimalValue = object
              .getInitialValue()
              .toString()
              .match(/^-?\d+(?:.\d{0,6})?/)[0];

            let result = {
              name: value,
              value: sixDecimalValue,
              unit: object.getUnit()
            };

            return result;
          })
        }
      },
      () => {},
      true
    );

    return this;
  }

  updateModel (data, callback, ignoreChange) {
    let newModel = {};
    if (!callback) {
      callback = () => {};
    }

    if (typeof ignoreChange == "undefined") {
      ignoreChange = false;
    }

    newModel = {
      ...this.state.model,
      ...data
    };

    newModel = new ModelInstance(newModel);

    this.setState(
      {
        model: newModel,
        changesHappened: !ignoreChange
      },
      () => callback()
    );
  }

  isInstanceBlocked () {
    let testId = this.props.model.id;
    let checkInstance = function (value, index, array) {
      return value.id === testId;
    };
    let instance = this.props.data.find(checkInstance);
    if (
      this.state.isBlocked === false &&
      (instance.block.isBlocked || instance.tags.indexOf("deprecated") !== -1)
    ) {
      this.setState({ isBlocked: true });
    }
  }

  render () {
    let blockedWarning = (
      <div style={{ fontSize: "18px", paddingLeft: "12px" }}>
        <p>
          <i className="fa fa-lock" style={{ fontSize: "23px" }} />
          &nbsp; This model instance is locked because it has already a
          score associated to it or model class of this instance has no
          import path, only tags can be edited. Clone from the grid view to
          create a different instance.
        </p>
      </div>
    );
    return (
      <span className="model-form">
        <div className="first-line">
          {this.state.isBlocked ? blockedWarning : undefined}
          <div className="container">
            <TextField
              value={this.state.model.name}
              className="model-name"
              errorText={
                this.state.model.errors !== undefined &&
                "name" in this.state.model.errors
                  ? this.state.model.errors["name"]
                  : ""
              }
              floatingLabelText="Name of the model"
              underlineStyle={{ borderBottom: "1px solid grey" }}
              onChange={(event, value) => {
                this.updateModel({ name: value }, () => {
                  if (!this.state.model.validate()) {
                    this.setState({ validationFailed: true });
                  } else {
                    this.setState({ validationFailed: false });
                  }
                });
              }}
              disabled={this.state.isBlocked}
            />
            <TextField
              value={this.state.model.url}
              className="url"
              floatingLabelText="Source URL"
              errorText={
                this.state.model.errors !== undefined &&
                "url" in this.state.model.errors
                  ? this.state.model.errors["url"]
                  : ""
              }
              underlineStyle={{ borderBottom: "1px solid grey" }}
              onChange={(event, value) => {
                this.updateModel({ url: value }, () => {
                  if (!this.state.model.validate()) {
                    if (
                      this.state.model.errors !== undefined &&
                      "url" in this.state.model.errors
                    ) {
                      this.setState({ validationFailed: true });
                    }
                  } else {
                    this.setState({ validationFailed: false });
                  }
                  this.checkUrl(value);
                });
              }}
              disabled={this.state.isBlocked}
            />
            <span className="icons">
              {this.state.successClasses ? (
                <SvgIcon style={{ color: "green" }}>{OKicon}</SvgIcon>
              ) : null}
              {this.state.failClasses ? (
                <SvgIcon style={{ color: "red" }}>{Xicon}</SvgIcon>
              ) : null}
              {this.state.loadingClasses ? (
                <CircularProgress size={36} />
              ) : null}
            </span>
          </div>
        </div>

        <div className="second-line">
          <div className="container">
            <SelectField
              id="modelFormSelectClass"
              labelStyle={{
                position: "relative",
                top: "-10px"
              }}
              floatingLabelText="Select class"
              errorText={this.getModelClassError().map(value => value)}
              iconStyle={{
                background: "#000",
                padding: "2px",
                width: "28px",
                height: "28px"
              }}
              value={this.state.model.model_class.id}
              underlineStyle={{ borderBottom: "1px solid grey" }}
              dropDownMenuProps={{
                menuStyle: {
                  border: "1px solid black",
                  backgroundColor: "#f5f1f1"
                },
                anchorOrigin: {
                  vertical: "center",
                  horizontal: "left"
                }
              }}
              onChange={(event, key, value) => {
                for (let klass of this.state.modelClasses) {
                  if (klass.id == value) {
                    this.updateModel(
                      { model_class: klass },
                      () => {
                        if (!this.state.model.validate()) {
                          this.setState({
                            validationFailed: true
                          });
                        } else {
                          this.setState({
                            validationFailed: false
                          });
                        }
                      },
                      this.props.actionType == "edit" &&
                        this.state.isBlocked
                    );
                  }
                }
              }}
              disabled={this.state.isBlocked}
            >
              {this.state.modelClasses.map(klass => (
                <MenuItem
                  value={klass.id}
                  key={klass.id}
                  primaryText={klass.class_name}
                  label={klass.class_name}
                />
              ))}
            </SelectField>

            <TextField
              value={this.state.newTag}
              onChange={(e, value) => {
                this.setState({ newTag: value });
              }}
              className="new-tag"
              floatingLabelText="Add a new tag"
              underlineStyle={{ borderBottom: "1px solid grey" }}
              onKeyPress={e =>
                e.key === "Enter"
                  ? this.addTag(this.state.newTag.toLowerCase())
                  : null
              }
            />

            <div className="tags">
              {/* eslint-disable-next-line react/no-array-index-key */}
              {this.state.model.tags.map(
                function (tag, i) {
                  if (typeof tag.name !== "undefined") {
                    return (
                      <Chip
                        backgroundColor={
                          (tag.name.toLowerCase() === "deprecated" || tag.name.toLowerCase() === "unschedulable")
                            ? red400
                            : brown500
                        }
                        style={{
                          marginLeft: 4,
                          marginTop: 4,
                          float: "left"
                        }}
                        key={tag.name + "-" + i}
                        onRequestDelete={() => this.deleteTag(tag)}
                      >
                        {tag.name.toString()}
                      </Chip>
                    );
                  } else {
                    return (
                      <Chip
                        backgroundColor={
                          (tag.toLowerCase() === "deprecated" || tag.toLowerCase() === "unschedulable")
                            ? red400
                            : brown500
                        }
                        style={{
                          marginLeft: 4,
                          marginTop: 4,
                          float: "left"
                        }}
                        key={tag + "-" + i}
                        onRequestDelete={() => this.deleteTag(tag)}
                      >
                        {tag}
                      </Chip>
                    );
                  }
                }.bind(this)
              )}
            </div>
          </div>
        </div>

        <div className="fourth-line">
          <h3>Model parameters</h3>
          {/* eslint-disable-next-line react/no-array-index-key */}
          {this.state.paramsErrors.map((value, index) => (
            <p key={index} style={{ color: "red" }}>
              {value}
            </p>
          ))}
        </div>

        <div className="fifth-line">
          <RaisedButton
            label="Open"
            disabled={this.state.paramsDisabled}
            className="actions-button"
            style={{
              padding: "0px",
              margin: "10px 0 0 0"
            }}
            onClick={() => this.setState({ modelParamsOpen: true })}
          />

          <span className="icons">
            {this.state.successParams ? (
              <SvgIcon style={{ color: "green" }}>{OKicon}</SvgIcon>
            ) : null}
            {this.state.paramsErrors.length > 0 ? (
              <SvgIcon style={{ color: "red" }}>{Xicon}</SvgIcon>
            ) : null}
            {this.state.loadingParams ? (
              <CircularProgress size={36} />
            ) : null}
          </span>

          <Dialog
            modal
            actions={[
              <FlatButton
                label="Close"
                key="close-button"
                primary
                onClick={() => this.setState({ modelParamsOpen: false })}
              />
            ]}
            autoScrollBodyContent
            contentStyle={{
              width: "75%",
              maxWidth: "none"
            }}
            contentClassName="centered-modal"
            open={this.state.modelParamsOpen}
          >
            <ParamsTable
              stateVariables={this.state.stateVariables}
              watchedVariables={
                typeof this.state.model.run_params.watchedVariables !=
                "undefined"
                  ? this.state.model.run_params.watchedVariables
                  : []
              }
              params={this.state.params}
              onCheck={this.saveChecked}
              onUncheck={this.removeChecked}
              removeAll={this.removeAll}
              addAll={this.addAll}
              disabled={this.state.isBlocked}
            />
          </Dialog>
        </div>

        <div className="actions-container">
          <RaisedButton
            label="save"
            disabled={
              this.state.loadingParams ||
              this.state.loadingClasses ||
              this.state.validationFailed ||
              Object.entries(this.state.model.errors).length > 0 ||
              (this.state.isBlocked && !this.state.changesHappened)
            }
            className="actions-button"
            onClick={() => {
              if (
                this.state.model.validate() &&
                !this.state.loadingParams
              ) {
                this.setState({
                  validationFailed: false
                });
                this.onSave(this.state.model);
              } else {
                this.setState({
                  validationFailed: true
                });
              }
            }}
          />

          <RaisedButton
            label="cancel"
            className="actions-button"
            onClick={() => this.onCancel()}
          />
        </div>
      </span>
    );
  }
}
