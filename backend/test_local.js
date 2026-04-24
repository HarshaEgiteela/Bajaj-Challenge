const axios = require('axios');

const data = {
    "data": [
        "A->B", "A->C", "B->D", "C->E", "E->F",
        "X->Y", "Y->Z", "Z->X",
        "P->Q", "Q->R",
        "G->H", "G->H", "G->I",
        "hello", "1->2", "A->"
    ]
};

axios.post('http://localhost:8080/bfhl', data)
    .then(res => {
        console.log(JSON.stringify(res.data, null, 2));
    })
    .catch(err => {
        console.error(err.message);
    });
