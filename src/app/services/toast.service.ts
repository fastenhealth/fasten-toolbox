import {Injectable} from '@angular/core';
import {ToastNotification, ToastType} from '../models/fasten/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts: ToastNotification[] = [];
  constructor() { }

  show(toastNotification: ToastNotification) {
    if(!toastNotification.title){
      if(toastNotification.type == ToastType.Error){
        toastNotification.title = "Error";
      }else if(toastNotification.type == ToastType.Success){
        toastNotification.title = "Success";
      }else{
        toastNotification.title = "Notification";
      }
    }

    if(toastNotification.type == ToastType.Error){
      toastNotification.displayClass = 'alert-error';
    } else if(toastNotification.type == ToastType.Success){
      toastNotification.displayClass = 'alert-success';
    } else {
      toastNotification.displayClass = 'alert-info';
    }

    this.toasts.push(toastNotification);

    if (toastNotification.autohide !== false) {
      const delay = toastNotification.delay ?? 5000;
      setTimeout(() => this.remove(toastNotification), delay);
    }
  }

  remove(toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  clear() {
    this.toasts.splice(0, this.toasts.length);
  }
}
