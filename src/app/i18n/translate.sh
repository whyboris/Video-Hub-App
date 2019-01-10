# get the args
NEW_LANG_NAME=$1
NEW_LANG_CODE=$2
# make our new lang file
cp en.ts $NEW_LANG_CODE.ts
# rip out all the strings
sed -n "s/^.*'\(.*\)'.*$/\1/ p" $NEW_LANG_CODE.ts > to_translate.txt
touch translated.txt
# HUMAN DO WORK PLZ
read -p "Please copy to_translate.txt contents into Google Translate, and paste the translations into a file called translated.txt"
# replace each line from to_translate.txt with each line in translate.txt in our new file
# also update the const name!
while read -r en && read -r tr <&3; do
  # show what we're gonna do
  echo "$en -> $tr"
  # bam!
  export FNAME=$NEW_LANG_CODE.ts
  export FIND=$en
  export REPLACE=$tr
  node -e "fs=require('fs');fs.readFile(process.env.FNAME,'utf8',(err,data)=>{if(err!=null)throw err;fs.writeFile(process.env.FNAME,data.replace('\\''+process.env.FIND+'\\'','\\''+process.env.REPLACE.split('\\'').join('\\\\\\'')+'\\''),'utf8',e=>{if(e!=null)throw e;});});"
done < to_translate.txt 3< translated.txt
export FIND="English"
export REPLACE=$NEW_LANG_NAME
node -e "fs=require('fs');fs.readFile(process.env.FNAME,'utf8',(err,data)=>{if(err!=null)throw err;fs.writeFile(process.env.FNAME,data.replace(process.env.FIND,process.env.REPLACE.split('\\'').join('\\\\\\'')),'utf8',e=>{if(e!=null)throw e;});});"
