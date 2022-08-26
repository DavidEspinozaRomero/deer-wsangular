import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Manager, Socket } from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  //#region variables
  settings = {
    conected: false,
  };
  users: any[] = [];
  messages: Message[] = [];
  form: FormGroup = this.fb.group({
    // user: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(3)]],
  });
  jwt: FormControl = this.fb.control('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  private URLWS: string = 'http://localhost:3000/socket.io/socket.io.js';
  manager: any;
  socket!: Socket;
  //#endregion variables

  constructor(
    private readonly fb: FormBuilder //  private readonly
  ) {}

  ngOnInit(): void {}

  connectToServer() {
    if (!this.jwt.valid) {
      console.log('!valid');
      return;
    }
    this.manager = new Manager(this.URLWS, {
      extraHeaders: {
        authorization: this.jwt.value,
      },
    });

    this.socket?.removeAllListeners();
    this.socket = this.manager.socket('/');

    this.socket.on('connect', () => {
      console.log('conect');
      this.settings.conected = true;
    });
    this.socket.on('disconnect', () => {
      console.log('disconect');
      this.settings.conected = false;
    });

    this.socket.on('clients-updated', (clients: string[]) => {
      console.log(clients);
      this.users = clients;
    });

    this.socket.on(
      'message-from-server',
      (payload: { fullName: string; message: string }) => {
        this.messages.push(payload);
      }
    );
  }

  save() {
    if (!this.form.valid) {
      return;
    }
    this.socket.emit('message-from-client', {
      id: 'YO!!',
      message: this.form.get('message')?.value,
    });
    console.log(this.socket);

    // console.log(this.form.value, this.jwt.value);
  }
}

interface Message {
  fullName: string;
  message: string;
}
