export JAVA_OPTS=


export PROJECT_HOME="$( cd "$(dirname "$0")" ; pwd -P )"
export JOURNAL_HOME="$PROJECT_HOME/runtime/journals"
export HOST_NAME="localhost"

JAVA_OPTS="-Dhostname=${HOST_NAME} ${JAVA_OPTS}"
JAVA_OPTS="-Dnanos.webroot=${PWD} ${JAVA_OPTS}"
JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=$JOURNAL_HOME"
# JAVA_OPTS="${JAVA_OPTS} -DDOCUMENT_HOME=$DOCUMENT_HOME"

DEBUG_PORT=8000
DEBUG_SUSPEND=n
JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=${DEBUG_SUSPEND},address=${DEBUG_PORT} ${JAVA_OPTS}"


CLASSPATH=$(JARS=("target/lib"/*.jar); IFS=:; echo "${JARS[*]}")
CLASSPATH="build/classes/java/main:$CLASSPATH"

echo "INFO :: ${JAVA_OPTS}"

exec java -cp "$CLASSPATH" $JAVA_OPTS foam.nanos.boot.Boot
