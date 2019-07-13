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

# check if item is in a list
in_list() {
  for i in $2; do
    if [ $i = $1 ]; then
      result="true"
      return 0
    fi
  done
  result="false"
  return 1
}

# check current OS
get_os() {
  unm=`uname | awk '{print $1}'`
  case "$unm" in
    "Darwin")
      SED_HACK='""'
      ;;
    *)
      SED_HACK=''
      ;;
  esac
  return 0
}

# check OS
get_os

# check if NEW_LANG_CODE is in app-state.ts
_list1=`cat ../components/common/app-state.ts | grep 'export type SupportedLanguage' | cut -d'=' -f 2 | sed "s/^ '//" | sed "s/';$//" | sed "s/' | '/ /g"`
in_list $NEW_LANG_CODE "$_list1"
if [ $result = "true" ]; then
  echo $NEW_LANG_CODE 'already in app-state.ts'
else
  sed -i $SED_HACK "/export type SupportedLanguage/ s/;$/ | '$NEW_LANG_CODE';/" ../components/common/app-state.ts
  echo 'added' $NEW_LANG_CODE 'to app-state.ts...'
fi

# check if NEW_LANG_CODE is in home.component.ts
_list2=`cat ../components/home/home.component.ts | grep i18n | cut -d'/' -f 4 | cut -d"'" -f 1`
in_list $NEW_LANG_CODE "$_list2"

if [ $result = "true" ]; then
  echo $NEW_LANG_CODE ' already in home.component.ts'
else
  last=`echo $_list2 | awk '{print $NF}'`
  sed -i $SED_HACK "/i18n\/$last/ s/$/\nimport \{ $NEW_LANG_NAME \} from '..\/..\/i18n\/$NEW_LANG_CODE';/" ../components/home/home.component.ts
  echo 'added' $NEW_LANG_CODE 'to home.component.ts...'

  # add case
  test=`cat ../components/home/home.component.ts | grep "$(echo "case '$NEW_LANG_CODE'")"`
  if [ $test ]; then
    echo $NEW_LANG_CODE ' case already added'
  else
    get_os
    sed -i $SED_HACK "/this.appState.language = '$last'/ s/$/\n        break;\n      case '$NEW_LANG_CODE':\n        this.translate.use('$NEW_LANG_CODE');\n        this.translate.setTranslation('$NEW_LANG_CODE', $NEW_LANG_NAME );\n        this.appState.language = '$NEW_LANG_CODE';/" ../components/home/home.component.ts
    echo 'added case for' $NEW_LANG_CODE 'in home.component.ts...'
  fi

  # add option entry to home.componente.html template
  test=`cat ../components/home/home.component.html | grep $NEW_LANG_CODE`
  if [ $test ]; then
    echo $NEW_LANG_CODE ' already in home.component.html'
  else
    get_os
    sed -i $SED_HACK "/value=\"$last\"/ s/$/\n            <option value=\"$NEW_LANG_CODE\" \[selected\]=\"appState.language == '$NEW_LANG_CODE'\">$NEW_LANG_NAME<\/option>/" ../components/home/home.component.html
    echo 'added option entry for' $NEW_LANG_CODE 'in home.component.html...'
  fi
fi
