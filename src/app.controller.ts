import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {workdir} from './home/home.controller'
const path = require('path')


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    //return this.appService.getHello();
    return path.join('http://192.168.151.10:3000/',workdir)



  }
}
