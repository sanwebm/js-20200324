export class NotificationMessage {
  static activeNotification;

  constructor (message, {
      duration = 2000,
      type = 'success',
    } = {}) {

/*
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }
*/

    this.message = message;
    this.durationInSeconds = (duration / 1000) + 's';
    this.type = type;
    this.duration = duration;

    this.render();
  }

  get template () {
    return `<div class="notification ${this.type}" style="--value:${this.durationInSeconds}">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    </div>`;
  }

  render () {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    NotificationMessage.activeNotification = this.element;
  }

  show (parent) {
    const root = parent || document.body;
    root.append(this.element);

    setTimeout(() => {
      this.remove();
    }, this.duration);

    return this.element;
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();
    NotificationMessage.activeNotification = null;
  }
}

export class SuccessNotificationMessage extends NotificationMessage{
  constructor(message, {duration = 2000} = {}){
    super(message, {duration: duration, type: 'success'});
  }
}

export class WarningNotificationMessage extends NotificationMessage{
  constructor(message, {duration = 2000} = {}){
    super(message, {duration: duration, type: 'warning'});
  }
}

export class ErrorNotificationMessage extends NotificationMessage{
  constructor(message, {duration = 2000} = {}){
    super(message, {duration: duration, type: 'error'});
    document.addEventListener('pointerdown', event => this.onPointerDown(event));
  }

  onPointerDown(event){
    if (event.which !== 1) return;
    let closeElement = event.target.closest('span.close');
    if (!closeElement) return;
    if (closeElement.closest('div.notification') === this.element) {
      this.remove();
    }

  }

  show (parent) {
    const root = parent || document.body;
    root.append(this.element);

    return this.element;
  }

  get template () {
    return `<div class="notification ${this.type}">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}<span class="close">×</span></div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    </div>`;
  }

}

