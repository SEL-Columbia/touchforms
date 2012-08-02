import sys
import os
import os.path

CUR_DIR = os.path.dirname(__file__)

initialized = False

def init_classpath():
    jardir = os.path.join(CUR_DIR, 'jrlib')
    jars = [k for k in os.listdir(jardir) if k.endswith('.jar')]

    global initialized
    if not initialized:
        for jar in jars:
            if jar not in sys.path:
                sys.path.append(os.path.join(jardir, jar))
        initialized = True

def init_jr_engine():
    from org.javarosa.model.xform import XFormsModule
    XFormsModule().registerModule()
