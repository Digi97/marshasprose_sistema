export const url = "http://192.168.10.117:8081/api/v1/";// //"http://192.168.10.117:8081/api/v1/";//"http://192.168.1.98:8081/api/v1/";//"http://172.20.10.3:8081/api/v1/"
export const host = "http://192.168.1.98:3000" //"http://192.168.10.182:3000"  //"http://localhost:3000/"

export const Login = "login";
export const Users = "users"

//netsh http add urlacl url=http://172.20.10.3:8081/ user=Todos

//netsh advfirewall firewall add rule name="IIS Express 8081" protocol=TCP dir=in localport=8081 action=allow