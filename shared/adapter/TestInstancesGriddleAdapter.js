import BaseAdapter from './BaseAdapter';
import InitialStateService from '../../services/InitialStateService.js';

export default class TestInstancesGriddleAdapter extends BaseAdapter {

    getGriddleData(){

        let testsData = [];

        for (let test of this.getRawData()){

            let options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZone: 'UTC',
                timeZoneName: 'short'
            };

            let fullDate = new Date(test.timestamp).toLocaleString('en-US', options);
            let shortDate = new Date(test.timestamp).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            testsData.push({
                name: test.test_class.class_name,
                class: test.test_class.class_name,
                tags: test.tags.map((item) => item.name),
                owner: "?",
                timestamp: {full: fullDate, short: shortDate},
                _timestamp: test.timestamp,
                block: false
            });
        }

        if (testsData.length == 0)
            testsData = new InitialStateService()
                .getInitialStateTemplate()
                .testInstances
                .data;

        return testsData;

    }

}
