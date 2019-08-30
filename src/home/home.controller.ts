import { Controller, Get, Param,Header,Res,Headers} from '@nestjs/common'
import {HomeService} from './home.service'
import * as fs from 'fs';
import { Response } from 'express';
import { Extension, isvideo,visitor, clearvideofile, isphoto, issound } from 'src/color/json'; //引用了兩個函式  
const path =require('path')

export const workdir ='/home/'
//export const workdir='./src/home/'
//export const workdir ='/media'
@Controller(path.basename(workdir))
export class HomeController {
//fuck you
    
    constructor(private  homeservice :HomeService){}
    //  http://127.0.0.1:3000/home/Native.mp4=play
    @Get() //讀取 /home 目錄下的資料
    @Header("Content-Type","application/json")//不加這一行 會默認為 text/html 
    async showdir(){

        const file =await this.homeservice.readirs(''); //為根目錄 因此參數放入''即可
        return String(file);
    }

    @Get('=get:mod')
    @Header("Content-Type","application/json")
    async show(@Param('mod') mod)
    {
        await clearvideofile();
        if(mod == 'video')
            return visitor(workdir,1)
        else if(mod == 'photo')
        return visitor(workdir,2)
        else
            return visitor(workdir,3)

    }

    /*
        getvideo -----> mod == 1
        getphoto -----> mod == 2
        getsound -----> mod == 3
     */ 
    @Get('*=get:mod')
    @Header("Content-Type","application/json")
    async showvideo(@Param('0') folder,@Param('mod') mod){
        
        await clearvideofile();

        if(mod == 'video')
            return visitor(path.join(workdir,String(folder)),1)
        else if (mod == 'photo')
            return visitor(path.join(workdir,String(folder)),2)
        else
            return visitor(path.join(workdir,String(folder)),3)
    
    }

    //                                 檔案名稱.副檔名=play
    // e.g. http://127.0.0.1:3000/home/Native.mp4=play
    // 有些瀏覽器不支援直接讀取.mp4檔案
    //因此用HTML <video>將.mp4檔案內嵌在此
    
    //https://docs.nestjs.cn/6/controllers?id=路由參數
    //使用路由參數
    //      檔案名稱.副檔名=play
    @Get('*.:extent=play') 
    async play(@Param() path){
        const servername ='192.168.151.10:3000' 
        //將檔案路徑的 '/' 全部替換成 '%2F'
        return ' <video   controls><source src="http://'+servername+'/home/'+path[0] +'.'+path.extent+'"'+ 'type="video/mp4">Your browser does not support the video tag.</video> '
                                                        //主機名稱       //檔案路徑（用以判別是否為檔案//副檔名
    }

    @Get('*.:extent=info') //這邊用以讀取檔案資訊 以json檔的形式會出
    @Header("Content-Type","application/json")//不加這一行 會默認為 text/html 
    async info(@Param('0') folder,@Param('extent') extension){  //將特定參數標記成 folder,extension 再傳給裝飾器
              
        
        if(await this.homeservice.exist(folder,extension,1) === false) //判斷檔案是否存在 如果不存在就回傳 404
        {   
            const report = '{"statusCode":404,"message":"no such file or directory"}'
            return report
        }

        else  if(await !isvideo(extension) && await !isphoto(extension) && await !issound(extension)) //如果檔案並非 mp4,avi,png 等等的影音檔 則拒絕存取
        {   
          
            const report = '{"statusCode":403,"message":"Forbidden"}'
           
            return '{"statusCode":403,"message":"Forbidden"}'
        }
        const file =folder+'.'+extension  
        const output = await this.homeservice.readirs(file); //把檔案名稱與副檔名 合併傳給readirs 抓出檔案資訊
        return String(output);
     
    }
/*
    讀取 /home目錄下的檔案
    只支援'mp4','avi','flv','png','jpg','jpeg','gif的讀取
    然而 avi flv 只支援下載 無法在線上觀看


    How to return a pdf file in response ?(@res ,res.set,Content-type改變方法)
        ref:https://github.com/nestjs/nest/issues/1090

    HTTP 206 Partial Content In Node.js (@Headers,request 的使用方法)
        ref：https://www.oschina.net/translate/http-partial-content-in-node-js#Introductio
        ref:https://www.codeproject.com/Articles/813480/HTTP-Partial-Content-In-Node-js

*/
    @Get('*.:extension')
    async readfile(@Param('0') folder,@Param('extension') extension,@Res() res:Response,@Headers('range') range)
    {   //folder檔案路徑 extension副檔名 @Hearders 為 request.headers 則 range 為 request.headers['range']
        //客戶端 會請求需要讀取的部份以 request.headers['range'] 來請求
        //我在 response hearder 有寫 Accept-Ranges: bytes 表明支援 斷點續傳 可並行多range進行下載 

        
        
        if(await this.homeservice.exist(folder,extension,1) === false)//檔案如果不存在 回傳404
        {   
            res.set({                
                'Content-Type' : 'application/json'
            })
            const report = '{"statusCode":404,"message":"no such file or directory"}'
            res.status(404).send(report)       
            return
        }

        else if(await this.homeservice.isdir(folder+'.'+extension)) //這邊不加await 會有異步的問題
        {
            res.set({                
                'Content-Type' : 'application/json'
            })
            res.send(String(this.homeservice.readirs(folder+'.'+extension)))
            return
        }


        else  if(await !isvideo(extension) && await !isphoto(extension) && await !issound(extension)) //如果檔案並非 mp4,avi,png 等等的影音檔 則拒絕存取
        {   
            res.set({                
                'Content-Type' : 'application/json'
            })
            const report = '{"statusCode":403,"message":"Forbidden"}'
            res.status(403).send(report)       
            return
        }

        
        const stats = fs.statSync(path.join(workdir,folder)+'.'+extension) //讀取目標檔案的資訊 
        var rangeRequest = this.homeservice.readRangeHeader(range, stats.size)//解讀 range內的 start,end 且給予檔案大小 
        console.log('start = '+ rangeRequest.Start +' end = '+rangeRequest.End)
        const start = rangeRequest.Start
        const end  = rangeRequest.End //設定檔案讀取的起始點與結束點

      
        let stream
        if(range === undefined) //如果range沒有被指定 從頭到尾讀取整個檔案
        {
            
            stream = this.homeservice.readfile(folder,extension,0,Infinity) 
            //                              檔案路徑,副檔名,開始位置==0,結束位置==INF ---->從頭讀到尾
            res.set({
            'Context-Type' : Extension(extension), //將副檔名 轉成他的mime name 更改 context-type 不然會是默認的text/html
            'Content-Length': stats.size,   //檔案長度   
            })
            stream.pipe(res)  //readable.pipe(destination[, options]) 將可讀流自動轉成 流動模式
        }

            
        else
        {
            const Content_range = 'bytes ' + String(start) + '-' + String(end)+ '/'  + String(stats.size) 
            //寫入 該檔案的範圍
            //Content-Range: <unit> <range-start>-<range-end>/<size>  e.g. Content-Range: bytes 17301504-991918297/991918298
            stream = this.homeservice.readfile(folder,extension,start,end) //將檔案路徑 開始點 與 結束點 傳給此函數 會回傳一個可讀流回來
            res.set({
            'Context-Type' : Extension(extension), //將副檔名 轉成他的mime name 更改 context-type 不然會是默認的text/html
            'Content-Range': Content_range,
            'Accept-Ranges': 'bytes', 
            'Content-Length': start == end ? 0 : (end - start + 1), //檔案長度 為結束點減去起始點
            'Cache-Control' : 'no-cache' //不抓任何快取 ref:https://blog.techbridge.cc/2017/06/17/cache-introduction/
            })
            res.status(206)
            stream.pipe(res)

        }
            
       
    }

    /*
        
        讀取目錄 :  以json檔的形式表現
        在home之後的檔案 請用 %2F 替代 /
        e.g : http://192.168.151.163:3000/home/test%2Ftest2
    */

    @Get('*')
    @Header("Content-Type","application/json")//將content-type 改成json形式
    async showdirs(@Param() folder){
        
        folder = String(folder[0])
        if(await this.homeservice.exist(folder,'',0) === false) //如果不存在 回傳404
        {   
            
            return '{"statusCode":404,"message":"no such file or directory"}'
        }
    
        
        const file = await this.homeservice.readirs(String(folder)); //讀取資料夾的資訊
        return String(file);
        
        
    }    


    
}

