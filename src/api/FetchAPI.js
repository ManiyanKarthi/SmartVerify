
function fetchData(url, method, body, callback) {
    return fetch(url, {
        method: method,
        body: body,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
    }).then(callback);
}

class FetchApi {

    constructor(props){
        // this.baseurl = "http://10.165.7.169:3001";
        this.baseurl = "http://localhost:3001";
    }

    serachEmployeeDetails(data, callback){
        fetchData(this.baseurl + "/invoice/getUserData", "POST", data, callback);
    }

    addNewBill(data, callback){
        fetchData(this.baseurl + "/invoice/add", "POST", data, callback);
    }

}

export default FetchApi;
