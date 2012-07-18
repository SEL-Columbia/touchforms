================
 A django-based web XForms Player for touchscreens
================

Prerequisites
=============
* Python (2.6+ recommended)
* Django (1.2+ recommended)
* Java (1.5+ recommended)
* Jython (2.5+ required)
* Couch (1.1+ required)


Getting started
=============
Get the prerequisites.
Get the code.

Setup::
    pip install -r requirements.pip
    cp localsettings.example.py localsettings.py

Syncdb::
    python manage.py syncdb

Run the backend::
    cd backend
    jython xformserver.py 4444

Run the django frontend::
    python manage.py runserver

Play forms!

Ubuntu 12 Server Installation
======================

    # apt-get jython couchdb

    $ mkdir project_env

    $ virtualenv --no-site-packages project_env

    $ source project_env/bin/activate

    $ git clone git://github.com/modilabs/touchforms.git

    $ cd touchforms/touchforms

    $ pip install -r requirements.pip

if using MySQL

    $ pip install MySQL-python

    # service start couchdb

update local settings

    python manage.py syncdb
