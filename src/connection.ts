class Connection {
  host: string
  port: number

  constructor(host: string, port: number) {
    this.host = host
    this.port = port
    console.log('init', this.port)
  }

  authenticateDeviceAsync(deviceId: string) {
    console.log('this.host', this.host)
    console.log('this.port', this.port)
    console.log('deviceId', deviceId)
  }
}

export default Connection
