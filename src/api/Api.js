import React from 'react';

const fetchApi = (url,body,fetchData)=> {
        return fetch(url, {
                    method: 'POST',
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: body
                }).then(res => res.json());

}
export default  fetchApi;