import BaseAdapter from "./BaseAdapter";
import InitialStateService from "../../services/InitialStateService";
import Config from "../Config";

export default class ScoresGriddleAdapter extends BaseAdapter {

  getGriddleData (){

    let scoreData = [];

    for (let score of this.getRawData()){
      let testSuite = null;

      if (score.test_instance.test_suites.length > 0){
        testSuite = score.test_instance.test_suites[0].name;
      }

      let options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: "UTC",
        timeZoneName: "short"
      };

      let fullDate = new Date(score.timestamp).toLocaleString("en-US", options);
      let shortDate = new Date(score.timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      scoreData.push({
        name: score.test_instance.test_class.class_name,
        score: score,
        score_type: (score.score_class !== null) ? score.score_class.class_name : "",
        _sort_key: score.sort_key,
        test_class: score.test_instance.test_class.class_name,
        model: score.model_instance,
        hostname: score.test_instance.hostname,
        status: Config.scoreStatusMap[score.status],
        error: score.error,
        owner: score.owner.username,
        build_info: score.test_instance.build_info,
        timestamp: { full: fullDate, short: shortDate },
        _timestamp: score.timestamp
      });
    }

    if (scoreData.length == 0) {
      scoreData = new InitialStateService()
        .getInitialStateTemplate()
        .scores
        .data;
    }

    return scoreData;

  }
}
