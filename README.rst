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

Syncdb::
    pip install -r requirements.pip
    python manage.py syncdb
    
Run the backend::
    cd backend
    jython xformserver.py 4444

Run the django frontend::
    python manage.py runserver
    
Play forms!

