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
  # deal with d'em quotes!
  tr=$(echo "$tr" | sed -e "s/'/\\\\\\\\'/g")
  # show what we're gonna do
  echo "$en -> $tr"
  # bam!
  sed -i '' "s/'$en'/'$tr'/g;s/English/$NEW_LANG_NAME/g" $NEW_LANG_CODE.ts
done < to_translate.txt 3< translated.txt
