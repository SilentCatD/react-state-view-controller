class ControllerNotProvided extends Error {
  constructor(msg: string) {
    super(msg)
    Object.setPrototypeOf(this, ControllerNotProvided.prototype)
  }
}
export { ControllerNotProvided }
