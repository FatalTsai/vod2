import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Readable } from 'stream';
import { json, } from 'src/color/json';
import {workdir} from './home.controller'
const path =require('path')
@Injectable()
export class HomeService {

    

    //讀取資料夾（檔案的資訊） 套用函式庫 fs
    readirs(folder){

        
        const stats=fs.statSync(path.join(workdir,folder))

        var files=stats.isDirectory() ? fs.readdirSync(path.join(workdir,folder)) : [] 
         //fs.readirSync 函數 用以讀取目標資料夾 下面的檔案與目錄 String陣列的形式 存於變數 files 裡面
         //如果這個並非目錄而是檔案 不需要讀取 因此存入[]

        return json(files,folder);  // 將資料夾與目標路徑 傳給 json(,) 整理成 json格式 再傳回 controller


    }


    // (檔案路徑,副檔名,開始讀取的位置,結束的)（以bytes做為讀取單位)
    readfile(folder,extent,start,end) 
    {
    
        const file = fs.createReadStream(path.join(workdir,folder)+'.'+extent,{start : start,end : end});
        //使用 fs.createReadStream 即便讀取大型檔案 也不會佔去太多 內存
        //fs.createReadStream(path[, options])
        /*
        
        options <string> | <Object>
            start <integer>
            end <integer> Default: Infinity
    
        */
        return file; 
    }   

    //後來的修改後 此函數沒有被使用到
    //此函數將 buffer 轉成可讀流
    getReadableStream(buffer: Buffer) {
        const stream = new Readable();
    
        stream.push(buffer);
        stream.push(null);//結尾要push(null) 否則無法正常讀取
    
        return stream;
    }//REF : https://github.com/nestjs/nest/issues/1090

    //（目標路徑,副檔名（資料夾的話放空字串就好）,是否為檔案）
    exist(file,extent,isfile)//用以判定目標 檔案或是資料夾 是否存在
    {                         //fs.existsSync 如果目標存在即回傳 true
  

        if(isfile)
            return fs.existsSync(path.join(workdir,file+'.'+extent))  //判定檔案是否存在
        else
            return fs.existsSync(path.join(workdir,file)) //判定資料夾是否存在

    }




    async isdir(folder)     //判定目標路徑是否為資料夾
    {
        const stat = fs.statSync(path.join(workdir,folder))
        return await stat.isDirectory()

    }



    /*

    此函數完全參考至此同名函數
    HTTP 206 Partial Content In Node.js
        ref:https://www.codeproject.com/Articles/813480/HTTP-Partial-Content-In-Node-js

        e.g Range: bytes=578093056-978093056
        此函式用以解讀request.headers['range'] 回傳準確的start,end參數(檔案讀取點)
    */
   //              （request.headers['range'],檔案大小）
    readRangeHeader(range,totalLength) {
        var array = String(range).split(/bytes=([0-9]*)-([0-9]*)/); //使用正規表示法 切割字串 array == ['',start,end,'']
        var start = parseInt(array[1]);
        var end = parseInt(array[2]);
       
        var result = {
            Start: isNaN(start) ? 0 : start,
            End: isNaN(end) ? (totalLength - 1) : end //如果request.header缺少start 或是 end（isNaN成立）  則將start ,end 設成檔案的頭跟尾

        };
       
        if (!isNaN(start) && isNaN(end)) {
            result.Start = start;
            result.End = totalLength - 1;
        }

        if (isNaN(start) && !isNaN(end)) {
            result.Start = totalLength - end;
            result.End = totalLength - 1;
        }
        
        return result;
        
    }


}
