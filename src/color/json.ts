import * as fs from 'fs';
import {HomeService} from '../home/home.service'
import {workdir} from '../home/home.controller'
const mediainfo = require('node-mediainfo');

const path =require('path')

/*
此函式將目標目錄的資訊包裝成一個 json檔案
陳列：
    "Name"  目錄名稱
    "Type"  檔案形式/目前都是目錄
    "Size" : 目錄大小 （以Byte作為單位
    "Path" : 此目錄的路徑位置
   "Children" : 此目錄底下的子目錄或是檔案

e.g:
   {
    "Name" : "home",
    "Type" : "directory",
    "Size" : "4096",
    "Path" : "/home/cheney/work/src/home/",
    "Children" : "[Cricket.avi,Gravity.mp4,Native.mp4,flvideo.flv,hello.gif,mp4icon.jpeg,star.mp4,test,video.mp4,]"
    }

*/

// 目前用以包裝來自 ./src/home/home.service.ts function readirs的資料



 export async function json(file,filepath) //path 為目標目錄的路徑
{                               //file為此目錄下 所有的子目錄與檔案 readirs會以 String[] 的形式傳送


    //console.log(workdir)
    filepath =path.join(workdir,filepath); //根目錄設定為 工作目錄下的 ./src/home/
    
   
    //變數  output 存等等要回傳的json目標目錄資訊
    let output ='{'         
    let stats = fs.statSync(filepath)  // fs.stats的同步版 回傳fs.stats
   
                                  //參數為目標目錄/檔案的 路徑
    var is_dir=stats.isDirectory() //判定此是否為資料夾
    let filesize =stats.size //讀取目錄的大小,不過目錄"本身"的大小似乎都相同   皆為4096 Bytes
   
    //下面三行程式碼的功能 就是取出 目標目錄的名稱
    // 通常是路徑最後一個 '/'後面的字串
    var tmp = filepath.split('/');     //將目錄以'/'分割成Array
    tmp = tmp.splice(tmp.length-2,tmp.length) //僅僅只保留陣列的最後兩項
    let filename = tmp[1]== '' ? tmp[0] :tmp[1] // e.g http://192.168.151.163:3000/home/test 如果以'/'分割 tmp =[home,test]
                                                //     http://192.168.151.163:3000/home/test/  ---> tmp =[test,'']
                                                //為了解決部份使用者習慣多打一個'/'因此最後一個或是倒數第二個'/' 後面的字串都有可能是檔名 需要特別作為判定
    output +='\n    "Name" : "' +filename+ '",' //檔名資訊加入output中

    
    output += is_dir? '\n    "Type" : "directory",': '\n    "Type" : "'+Extension(filename.split('.')[1])+'",'
   
    output +='\n    "Size" : "' +filesize + '",' //檔案/目錄大小
    output +='\n    "Path" : "' +filepath + '",' //檔案/目錄 路徑
    




    if(isvideo(filepath))
    {

        const result = await mediainfo('/home/coder01/work/src/home/Native.mp4');

        output += '\n"Format" :  "'+result.media.track[0].Format+ '",'
        output += '\n"Duration:" :  "'+secondsToHms(result.media.track[0].Duration)+ '",'



    }









    output += '\n   "Children" : [' //將目錄下的 檔案與子目錄 加入output中

    
    
    for(var i=0, firstfile=true ;i<file.length;i++) //這邊我應該用forEach()來寫 這個不是c++
    {                              //String[] file 代表目標目錄下 所有的子目錄與檔案 在此一一將檔名放進output
        let stats =fs.statSync(filepath+'/'+file[i])//讀取各個檔案或是目錄的資訊
        is_dir =stats.isDirectory()//判定是否為目錄或是只是一個檔案 //isvideo 判斷 該檔案的副檔名 是否為 .mp4 .avi .flv .png 等影音檔 以及是否為目錄 過濾掉其他檔案 
        
        if(isvideo(file[i]) || isphoto(file[i]) || issound(file[i])|| is_dir)
        {
            if(firstfile)
            { 
                firstfile = false
                output +=  '"'+file[i]+'"'
                
            }
            else
            {
                output+= ',"'+file[i]+'"'

            }
        }


    }
    output +=']\n}'


    
    return output

}


export function isvideo(file) //file為檔案名稱  //此函數用以判對輸入的檔案 副檔名 是不是以下 ExtensionList中的其中一個
{
    const tmp=file.split('.'); //將檔案名稱以 '.' 做為分割出 字串陣列    
    const Extension =tmp[tmp.length-1] //取檔案名稱中 最後一段'.'的字串 
    // e.g. 'http://192.168.151.163:3000/home/test%2Fearth.mp4' ---> 'mp4'
    //      'earth.mp4' --->'mp4'
    //最後一個'.'後面的就是副檔名
    const ExtensionList=['mp4','avi','flv','MP4','AVI']
    const contentname =['video/mp4','video/x-msvideo','video/x-flv','video/mp4','video/x-msvideo']
    if(ExtensionList.indexOf(Extension)!=-1)
        return true;
    
    else
        return false;
}
export function isphoto(file) //file為檔案名稱  //此函數用以判對輸入的檔案 副檔名 是不是以下 ExtensionList中的其中一個
{
    const tmp=file.split('.'); //將檔案名稱以 '.' 做為分割出 字串陣列    
    const Extension =tmp[tmp.length-1] //取檔案名稱中 最後一段'.'的字串 
    // e.g. 'http://192.168.151.163:3000/home/test%2Fearth.mp4' ---> 'mp4'
    //      'earth.mp4' --->'mp4'
    //最後一個'.'後面的就是副檔名
    const ExtensionList=['png','jpg','jpeg','gif','JPG']
    const contentname =['image/png','image/jpg','image/jpeg','image/gif','image/jpeg']
    if(ExtensionList.indexOf(Extension)!=-1)
        return true;
    
    else
        return false;
}

export function issound(file)
{
    const ExtensionList = ['.mp3'] //這邊前面要加點喔 因為我後來知道有函數可以套 配合他一下
    if(ExtensionList.indexOf(path.extname(file))!=-1)
        return true 
    else
        return false

}



export function Extension(name) //輸入副檔名名稱與對應他的mime名稱 
{
    const ExtensionList=['mp4','avi','flv','png','jpg','jpeg','gif','html','AVI']
    const contentname =['video/mp4','video/x-msvideo ','video/x-flv','image/png','image/jpg','image/jpeg','image/gif','text/html','video/x-msvideo ']

    const index = ExtensionList.indexOf(name)
    //e.g. name == 'avi'
    //Extension.indexOf('avi') == 1
    //contentname[1] ='video/x-msvideo'
    
    //利用indexOf搜尋該副檔名 在ExtensionList 對應的索引直
    //用此索引直 找處 在String[] contentname 中,對應的 mimename
    //似乎這裡使用map或是其他容器會比較好


    return contentname[index]
 }


let videofile =[]
let photofile =[]
let soundfile =[]
   

export async function visitor(node,mod) { //拜訪目標路徑底下的各個資料夾 找出 mod要求提供的檔案類型


    var files = fs.readdirSync(node); 
    files.forEach(function (filename) {
      var childnode = path.join(node,filename);
      var stats = fs.statSync(childnode);
      if (stats.isDirectory())  //如果是子目錄 繼續拜訪
      {
          visitor(childnode,mod)
      }
      else
      {
        
        if(isvideo(childnode) && mod == 1){
            videofile.push(translatepath(childnode))
        }
        else if(isphoto(childnode) && mod == 2)
        {
            photofile.push(translatepath(childnode))
        }
        else if (issound(childnode) && mod == 3)
        {
            soundfile.push(translatepath(childnode));
        }
              
    }
    });

    return mod == 1 ? videofile :(mod == 2? photofile :soundfile) 

}


export function clearvideofile()
{
    videofile =[]
    photofile =[]
    soundfile =[]
}


export function translatepath(node)//將路徑從絕對路徑改成由workdir底下的相對路徑
{
    console.log(node)
    node = node.replace(path.join(workdir,''),'')
    node = path.join(path.basename(workdir),node)

    return '/'+node
}

export function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}