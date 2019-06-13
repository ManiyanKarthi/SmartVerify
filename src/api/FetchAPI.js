
function fetchData(url, method, body, callback) {
    return fetch(url, {
        method: method,
        body: body,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
    }).then(callback);
}

class FetchApi {

    serachEmployeeDetails(data, callback){
        fetchData("http://10.165.7.169:3000/invoice/getUserData", "POST", data, callback);
    }

}

export default FetchApi;
