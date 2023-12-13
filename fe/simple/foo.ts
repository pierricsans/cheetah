import axios from 'axios';
import { Level } from './../protos/level_pb.js';


export const a: string = "hello";

var level = new Level();

function getInitialLevel() {
    axios({
        method: 'get',
        url: 'getInitialLevel',
        responseType: 'arraybuffer'
      }).then(function (response) {
            // handle success
            console.log(response);
            level.fromBinary(response.data);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            console.log(level.size);
        });
}


function Init() {
    console.log(level);
    getInitialLevel()
}

Init();