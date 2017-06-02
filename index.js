//index.js

const http = require('http');
const ps = require('process');
const localtunnel = require('localtunnel');
const os = require('os');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const port = Number(ps.argv[2]);
const subdomain = ps.argv[3];

let server;

const promise = new Promise((resolve, reject) => {
        server = http.createServer(requestHandler);

        server.listen(port, 'localhost',null,(err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(server);
                    };
        });
}).
  then(exposeToInternet).
                        then((data) => {
                                            console.log('tunnel listening on - ' + data.url);
                                            
                                        },
                             (err) => {
                                            console.log(err);
                                      }
                            );



function requestHandler(request, response)  {  
    console.log('handling -- ' + request.url);
    if (request.url == '/') {
        response.end(buildResponse(ip_addresses()));
    }
}



function  exposeToInternet(data) {
    
    const tunnel = localtunnel(port, 
                              {'subdomain': subdomain},
                              (err, tunnel) => {
                                  if (err) {
                                    console.log('error case');
                                       throw(err);
                                  } else {
                                      console.log('success case')
                                      console.log(tunnel.url);
                                      

                                  }
                            });
    
    return tunnel;                               
}


function ip_addresses() {
    let addresses = [];
    Object.keys(os.networkInterfaces()).forEach( (iface) => {      
                                                            
                                                    let data = os.networkInterfaces()[iface];
                                                    data.forEach((iface_props) => {
                            
                                                       if (iface_props['family'] == 'IPv4' && !iface_props['internal']) {
                                                            addresses.push(iface_props['address']);
                                                        }
                                                        /*
                                                        if (addresses.length > 0) {
                                                            console.log(iface + ':');  
                                                            addresses.forEach((address) => {
                                                                console.log('    ' + address);
                                                            });
                                                        }
                                                        */
                                                    });
                                                });
    return addresses;
}

function buildResponse(addresses) {
    const dom = new JSDOM(`<!DOCTYPE html><HEAD>HEAD><BODY><DIV></DIV></BODY>`);
    const document = dom.window.document;
    const ipdiv = document.querySelector('div');
 
    document.body.style.backgroundColor = 'blue';
    ipdiv.style.width = '100px';
    ipdiv.style.height = '400px';
    ipdiv.style.fontSize = 'xx-large';
    ipdiv.style.color = 'white';
    ipdiv.style.position = 'absolute';
    ipdiv.style.top = 0;
    ipdiv.style.bottom = 0;
    ipdiv.style.left = 0;
    ipdiv.style.right = 0;
    ipdiv.style.margin = 'auto';

    addresses.forEach((address) => {

        const child = ipdiv.appendChild(document.createElement('p'));
        child.textContent = address;
    });

    return dom.serialize();
}