import axios from 'axios';
import type { Level } from '../../protos/level_pb.d.ts';
const url: string = 'getLevel/1';


export const a: string = "hello";

function getInitialLevel() {
    axios.get('/getLevel=1')
        .then(function (response) {
            // handle success
            console.log(response);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
}

function Init() {
    console.log(a);
}