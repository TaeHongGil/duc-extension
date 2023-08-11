project=$1
gradlePath=$2
jvmPath=$3
tomcatWorkspace=$4

export GRADLE_HOME=$gradlePath
export PATH=$GRADLE_HOME/bin:$PATH
export JAVA_HOME=$jvmPath
export PATH=${PATH}:$JAVA_HOME/bin
cd $project

target=$(mvn help:effective-pom | sed -nE '/<finalName>/s/.*<finalName>([^<]*)<\/finalName>.*/\1/p')

mvn clean install -U

rm -rf $tomcatWorkspace/webapps/$target

cp -r $project/target/$target $tomcatWorkspace/webapps/