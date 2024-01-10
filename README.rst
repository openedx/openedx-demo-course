Open edX Demo Course, v2
########################

Contents
********

This repository contains a course and some libraries that you can import into your Open edX instance to learn more about platform features. This course is geared mainly towards instructors, but learners can also benefit from learning how the platform and problem types work. For convenience, we include both:

* The ``.tar.gz`` files for you to import into Studio, located in the ``./dist/`` folder.
* The source code (a.k.a. "OLX") in the other top-level folders.

.. list-table::
   :header-rows: 1

   * - Name
     - Key
     - Download
     - Source OLX
   * - *Open edX demo Course*
     - ``course-v1:demo+Course+1``
     - `<./dist/demo-course.tar.gz>`_
     - `<./demo-course>`_
   * - *Open edX Example Content Library*
     - ``library-v1:demo+ContentLibrary``
     - `<./dist/demo-content-library.tar.gz>`_
     - `<./demo-content-library>`_

Rationale
*********

This course and its associated libraries aim to expose as many Open edX Studio & courseware features as possible.
It does so by providing example usages of various block types and features such as cohorts and discussion forums. 

This course serves as a user-facing introduction and tutorial to the Open edX platform.

It is useful for basic testing, but also needs to remain a suitable first experience for Open edX learners.
For deep testing, we recommend using the `Open edX Test Course <https://github.com/openedx/openedx-test-course>`_.

Status
******

This course is new as of the Redwood (June 2024) release.

Usage
*****

To use this course and its libraries, you will need to import them into an Open edX instance. All new Open edX
instances will get this course installed by default.

Manual import
=============

In Studio:

1. Create a library with the org ``demo`` and the slug ``ContentLibrary``.
2. Import ``dist/demo-content-library.tar.gz`` into the library.
3. Create a course run with the org ``demo``, name ``Course``, and run ``1``.
4. Import ``dist/demo-course.tar.gz`` into the course run.

Scripted import (for Tutor users)
=================================

In the same environment that use to run tutor, execute the command::

  make import TUTOR=... TUTOR_CONTEXT=... LIBRARY_IMPORT_USER=...
  
where:

* ``TUTOR`` should be the command that you use to run Tutor (defaults to simply ``tutor``).
* ``TUTOR_CONTEXT`` should be the mode in which you want to import the course (defaults to ``local``, other acceptable values are ``k8s`` and ``dev``).
* ``LIBRARY_IMPORT_USER`` is the username of an existing user in your Open edX instance that will be given ownership of the imported library (defaults to ``admin``).

For example::

  # Import in developer mode using a custom tutor root, and make alice the library admin.
  make import TUTOR='tutor --root=~/tutor-root' TUTOR_CONTEXT=dev LIBRARY_IMPORT_USER=alice

Or::

  # Import in kubernetes mode, and make bob the library admin.
  make import TUTOR_CONTEXT=k8s LIBRARY_IMPORT_USER=bob

Re-generating the importable content
====================================

If you make changes to the course or library OLX and want to re-generate the importable ``.tar.gz`` files, simply run::

  make dist

This will package the OLX into the ``dist`` directory.

Contributing
************

Contributions of bug fixes are welcome. There are two ways you can make changes to this course.

OLX Editing
===========

If you are experienced with editing raw OLX, then you can make changes directly to the XML and asset files this repository. Before opening a pull request, please:

* Run ``make dist``, which will generate the ``dist/*.tar.gz`` archives. Include these changes in your commit.
* Import the updated ``dist/*.tar.gz`` archives into an Open edX Studio (as described above) and ensure the test course still works as expected, both in Studio and LMS.

Studio Editing
==============

Once you've imported the test course and libraries into an Open edX instance (as described above), you can edit the course and its libraries in Studio. Make sure to Publish any changes you make from Studio so that you can test them out in LMS.

When you're ready to contribute the changes back into this repository, simply:

1. Export the course and any libraries you changed.
2. Move to exported ``.tar.gz`` archives into this repository's ``dist/`` folder, and name them to match the top-level OLX folders. For example, the course archive should be named ``dist/demo-course.tar.gz``, and the problem bank archive should be named ``dist/demo-content-library.tar.gz``.
3. Run ``make unpack``, which will unpack the archives into OLX.
4. Review your OLX changes using ``git diff``.
5. Commit your changes and open a pull request.

Tag @openedx/openedx-demo-course-maintainers in all pull requests. We'll do our best to take a look! All pull requests should pass the GitHub Actions suite, which ensures that the course and libraries can be imported into a freshly-provisioned Tutor instance.

License
*******

All content is made available under a `Creative Commons BY-NC-SA 3.0 US
License <http://creativecommons.org/licenses/by-nc-sa/3.0/us/>`_.

All code is made available under an `AGPLv3 License <./AGPL_LICENSE>`_
