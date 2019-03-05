import BaseModel from "./BaseModel";

export default class TestClass extends BaseModel {

    id = null;
    url = "";
    class_name = "";
    observation_schema = ""
    test_parameters_schema = "";

    constructor (data) {
      super(data);

      if (!data) {
        return;
      }

      Object.assign(this, data);
    }

}
