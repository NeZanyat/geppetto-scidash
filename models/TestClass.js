import BaseModel from "./BaseModel";

export default class TestClass extends BaseModel {

  constructor (data){
    super(data);

    this.id = null;
    this.url = "";
    this.class_name = "";
    this.units_name = "";
    this.observation_schema = {};
    this.test_parameters_schema = {};

    if (!data){
      return;
    }

    Object.assign(this, data);
  }

}
