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
import { OKicon, Xicon } from "../../assets/CustomIcons";
import ModelClassApiService from "../../services/api/ModelClassApiService";
import FilteringService from "../../services/FilteringService";
import Config from "../../shared/Config";
import ModelParametersApiService from "../../services/api/ModelParametersApiService";
import ParamsTable from "./ParamsTable";
import ModelInstance from "../../models/ModelInstance";
import {red400, brown500} from 'material-ui/styles/colors';


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
      validationFailed: false
    };


    this.checkUrl = this.checkUrl.bind(this);
    this.updateModel = this.updateModel.bind(this);
    this.onSave = props.onSave.bind(this);
    this.onCancel = props.onCancel.bind(this);
    this.modelFactory = GEPPETTO.ModelFactory;
    this.deleteTag = this.deleteTag.bind(this);
    this.addTag = this.addTag.bind(this);
  }

  getModelClassError (){
    let errors = [];

    if(this.state.model.errors !== undefined)
      errors.push("model_class" in this.state.model.errors ? this.state.model.errors["model_class"] : "");
    errors.push(this.state.failClasses ? " / No compatible class found for this model" : "");

    return errors;
  }

  async checkUrl (url){

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

    filteringService.setupFilter("model_url", url, Config.modelCreateNamespace, false, false);

    let responseClasses = await classService.getList(false, Config.modelCreateNamespace);

    if (responseClasses.length > 0){
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

    let responseParams = await paramsService.getList(false, Config.modelCreateNamespace);

    if (responseParams.failed){
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
      this.setState({
        loadingParams: false,
        successParams: true,
        paramsDisabled: false
      });
    }
  }

  deleteTag(tag) {
    let { model } = this.state;
    for(var i = 0; i < model.tags.length; i++) {
      if(model.tags[i] === tag) {
        model.tags.splice(i, 1);
      }
    }
    this.updateModel({ tags: [...model.tags] });
  }

  addTag(newTag) {
    if(!this.state.model.tags.includes(newTag)) {
      this.updateModel({ tags: [...this.state.model.tags, newTag] });
      this.setState({newTag: ""});
    }
  }

  retrieveStateVariables () {
    this.setState({
      stateVariables: GEPPETTO.ModelFactory.getAllPotentialInstancesOfMetaType("StateVariableType")
    });
  }

  retrieveParams () {
    this.setState({
      params: GEPPETTO.ModelFactory.getAllPotentialInstancesOfMetaType("ParameterType")
    });
  }


  processModel (model){
    GEPPETTO.Manager.loadModel(JSON.parse(model.geppetto_model_loaded));

    this.retrieveStateVariables();
    this.retrieveParams();

    this.updateModel({
      "run_params": {
        "stateVariables": this.state.stateVariables,
        "params": this.state.params.map(value => {
          let object = eval(value);
          let sixDecimalValue = object.getInitialValue().toString().match(/^-?\d+(?:.\d{0,6})?/)[0];

          let result = {
            name: value,
            value: sixDecimalValue,
            unit: object.getUnit()
          };

          return result;
        })
      }
    });

    return this;
  }

  updateModel (data, callback) {
    let newModel = {};
    if (!callback) {
      callback = () => { };
    }

    newModel = {
      ...this.state.model,
      ...data
    };

    newModel = new ModelInstance(newModel);

    this.setState({
      model: newModel
    }, () => callback());
  }

  render () {

    return (
      <span className="model-form">
        <div className="first-line">
          <div className="container">
            <TextField
              value={this.state.model.name}
              className="model-name"
              errorText={
                (this.state.model.errors !== undefined && "name" in this.state.model.errors) ? this.state.model.errors["name"] : ""
              }
              floatingLabelText="Name of the model"
              underlineStyle={{ borderBottom: "1px solid grey" }}
              onChange={(event, value) => this.updateModel({ name: value })}
            />
            <TextField
              value={this.state.model.url}
              className="url"
              floatingLabelText="Source URL"
              errorText={
                (this.state.model.errors !== undefined && "url" in this.state.model.errors) ? this.state.model.errors["url"] : ""
              }
              underlineStyle={{ borderBottom: "1px solid grey" }}
              onChange={
                (event, value) => {
                  this.updateModel({ url: value }, () => {
                    if (!this.state.model.validate()) {
                      if (this.state.model.errors !== undefined && "url" in this.state.model.errors) {
                        this.setState({
                          validationFailed: true
                        });
                      } else {
                        this.checkUrl(value);
                      }
                    }
                  });
                }
              }
            />
            <span className="icons">
              {this.state.successClasses ? <SvgIcon style={{ color: "green" }}>{OKicon}</SvgIcon> : null}
              {this.state.failClasses ? <SvgIcon style={{ color: "red" }}>{Xicon}</SvgIcon> : null}
              {this.state.loadingClasses ? <CircularProgress size={36} /> : null}
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
              iconStyle={{ background: "#000", padding: "2px", width: "28px", height: "28px" }}
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
                    this.updateModel({ "model_class": klass });
                  }
                }
              }}
            >
              {this.state.modelClasses.map(klass => <MenuItem value={klass.id} key={klass.id} primaryText={klass.class_name} label={klass.class_name} />)}
            </SelectField>

            <TextField
              value={this.state.newTag}
              onChange={(e, value) => { this.setState({ newTag: value }); }}
              className="new-tag"
              floatingLabelText="Add a new tag"
              underlineStyle={{ borderBottom: "1px solid grey" }}
              onKeyPress={e => e.key === "Enter" ? this.addTag(this.state.newTag.toLowerCase()) : null}
            />

            <div className="tags">
              {/* eslint-disable-next-line react/no-array-index-key */}
              {this.state.model.tags.map(function(tag, i) { 
              if (typeof(tag.name) !== 'undefined') {
                return (<Chip 
                  backgroundColor={(tag.name.toLowerCase() === "deprecated") ? red400 : brown500}
                  style={{ marginLeft: 4, marginTop: 4, float: "left" }} 
                  key={`${tag.name}-${i}`}
                  onRequestDelete={() => this.deleteTag(tag)}>
                    {tag.name.toString()}
                </Chip>);
              } else {
                return (<Chip 
                  backgroundColor={(tag.toLowerCase() === "deprecated") ? red400 : brown500}
                  style={{ marginLeft: 4, marginTop: 4, float: "left" }} 
                  key={`${tag}-${i}`}
                  onRequestDelete={() => this.deleteTag(tag)}>
                    {tag}
                </Chip>);
              }
              
            }.bind(this))}
            </div>
          </div>
        </div>

        <div className="fourth-line">
          <h3>Model parameters</h3>
          {/* eslint-disable-next-line react/no-array-index-key */}
          {this.state.paramsErrors.map((value, index) => <p key={index} style={{ color: "red" }}>{value}</p>)}
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
            {this.state.successParams ? <SvgIcon style={{ color: "green" }}>{OKicon}</SvgIcon> : null}
            {this.state.paramsErrors.length > 0 ? <SvgIcon style={{ color: "red" }}>{Xicon}</SvgIcon> : null}
            {this.state.loadingParams ? <CircularProgress size={36} /> : null}
          </span>

          <Dialog
            modal
            actions={[<FlatButton
              label="Close"
              key="close-button"
              primary
              onClick={() => this.setState({ modelParamsOpen: false })}
            />,]}
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
              params={this.state.params}
            />
          </Dialog>
        </div>

        <div className="actions-container">
          <RaisedButton
            label={this.props.actionType === "edit" ? "edit" : "save"}
            disabled={this.state.loadingParams || this.state.loadingClasses}
            className="actions-button"
            onClick={() => {
              if (this.state.model.validate() && !this.state.loadingParams) {
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
