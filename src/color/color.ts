import * as fs from 'fs';


export function color(file,path){

    var i=0;
    var output= new String('<font color="green">');
    const oldpath=path;
    path=path.split('/').join("%2F");
    //console.log('color.path = '+path);
   // const fs = require('fs')
    const severname='http://localhost:3000';


    var tmp = path.split('%2F');

    //var tmp =path
    //console.log('tmp = '+tmp)
    tmp = tmp.splice(0,tmp.length-1)
    //console.log('tmp = '+tmp)
    const backpage = tmp.join('%2F');
    //console.log('backpage =' +backpage)
    //console.log('backpage[3] ='+backpage[3])




    for( i=0;i< file.length;i++)
    {
      
         
        var stats = fs.statSync("/home/cheney/work/src/home/"+oldpath+'/'+file[i]);
        //console.log('is directory ? ' +oldpath+'/'+file[i]+'  '+ stats.isDirectory());
        var is_dir=stats.isDirectory()
        
        //ref by:https://www.technicalkeeda.com/nodejs-tutorials/how-to-check-if-path-is-file-or-directory-using-nodejs

        //console.log(is_dir && ismp4(file[i]) );
        //console.log(is_dir);

        

        if(ismp4(file[i]))
        {

            output+='<img src=https://i.imgur.com/yaixvyC.jpg" alt="Smiley face" height="42" width="42">';
        }



        if(!path &&(is_dir ||  ismp4(file[i])))  
        { 
            output+='<a href="'+severname+'/home'+ String(path)+'/'+String(file[i])  +'" target="_blank">' + String(file[i])+ '</a><br>';
        }
        else if (is_dir ||  ismp4(file[i]))
        {
            output+='<a href="'+severname+'/home/'+ String(path)+'%2F'+String(file[i])  +'" target="_blank">' + String(file[i])+ '</a><br>'
        }

    }

    output+='<a href="'+severname+'/home/'+ String(backpage)  +'" target="_self">' + 'backpage'+ '</a><br>'


    //output=output.replace("/","%2F");

    //console.log('color.ts.output = '+output);
    return output;

}


export function ismp4(file)
{
    const tmp=file.split('.');
    
    //console.log("tmp[-1]="+ tmp[tmp.length-1]);

    if(tmp[tmp.length-1]=='mp4')
        return true;
    
    else
        return false;
}


