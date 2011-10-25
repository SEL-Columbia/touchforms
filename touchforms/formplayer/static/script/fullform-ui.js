
function getForm(o) {
  var form = o.parent;
  while (form.parent) {
    form = form.parent;
  }
  return form;
}

function loadFromJSON(o, json) {
  $.each(json, function(key, val) {
      if (key == 'children') {
        return;
      }

      o[key] = val;
    });
}

function Form(json) {
  this.children = [];

  this.init_render = function() {
    this.$container = $('<table id="form" border="1"></table>');
    render_elements(this, json);
  }

  this.reconcile = function(new_json) {
    reconcile_elements(this, new_json);
  }

  this.child_container = function() {
    return this.$container;
  }
}

function Group(json, parent) {
  loadFromJSON(this, json);
  this.parent = parent;
  this.is_repetition = parent.is_repeat;
  this.children = [];

  this.init_render = function() {
    this.$container = $('<tr><td colspan="2"><span id="caption"></span> <a id="del" href="#">delete</a><table id="children" border="1"></table></td></tr>');
    this.$children = this.$container.find('#children');
    this.$container.find('#caption').text(this.caption + ' [' + this.ix + ']');

    render_elements(this, json.children);

    this.$del = this.$container.find('#del');
    if (!this.is_repetition) { //todo: check constraints
      this.$del.hide();
    }

    var g = this;
    this.$del.click(function() {
        console.log('delete repetition ' + g.ix);
      });
  }

  this.reconcile = function(new_json) {
    //reconcile local fields
    reconcile_elements(this, new_json.children);    
  }

  this.destroy = function() {

  }

  this.child_container = function() {
    return this.$children;
  }
}

function Repeat(json, parent) {
  loadFromJSON(this, json);
  this.parent = parent;
  this.children = [];
  this.is_repeat = true;

  this.init_render = function() {
    this.$container = $('<tr><td colspan="2"><span id="caption"></span> <a id="add" href="#">add new</a><table id="children" border="1"></table></td></tr>');
    this.$children = this.$container.find('#children');
    this.$container.find('#caption').text(this['main-header'] + ' [' + this.ix + ']');

    render_elements(this, json.children);

    this.$add = this.$container.find('#add');
    var rep = this;
    this.$add.click(function() {
        gFormAdapter.newRepeat(rep);
      });
  }

  this.reconcile = function(new_json) {
    //reconcile local fields
    reconcile_elements(this, new_json.children);    
  }

  this.destroy = function() {

  }

  this.child_container = function() {
    return this.$children;
  }
}

function Question(json, parent) {
  loadFromJSON(this, json);
  this.parent = parent;
  this.children = [];

  this.init_render = function() {
    this.$container = $('<tr><td id="caption"></td><td><div id="widget"></div><div id="error" style="color: red;"></div></td></tr>');
    this.control = renderQuestion(this, this.$container.find('#widget'));
    this.$error = this.$container.find('#error');

    this.update();
  }

  this.reconcile = function(new_json) {
    console.log('imma reconcilin\' ' + this.ix);
    //update caption only?
    //compare everything, i guess
    //note that select choices may change due to itemsets
  }

  this.update = function() {
    this.$container.find('#caption').text(this.caption + ' [' + this.ix + ']');
  }

  this.getAnswer = function() {
    return this.control.getAnswer();
  }

  this.onchange = function() {
     if (this.control.prevalidate(this)) {
       gFormAdapter.answerQuestion(this);
     }
  }

  this.showError = function(content) {
    this.$error.text(content);
  }

  this.destroy = function() {
    this.control.destroy();
  }
}

function make_element(e, parent) {
    if (e.type == 'question') {
      var o = new Question(e, parent);
    } else if (e.type == 'sub-group') {
      var o = new Group(e, parent);
    } else if (e.type == 'repeat-juncture') {
      var o = new Repeat(e, parent);
    }
    o.init_render();
    return o;
}

function render_elements(parent, elems) {
  for (var i = 0; i < elems.length; i++) {
    var o = make_element(elems[i], parent);
    parent.children.push(o);
    parent.child_container().append(o.$container);
  }
}

function reconcile_elements(parent, new_elems) {
  var mapping = []; // (k_old, k_new)

  var inElementSet = function(e, set) {
    return $.map(set, function(val) { return val.ix; }).indexOf(e.ix);
    //compare repeat uuids here?
  }

  for (var i = 0; i < parent.children.length; i++) {
    var child = parent.children[i];
    mapping.push([i, inElementSet(child, new_elems)]);
  }
  for (var i = 0; i < new_elems.length; i++) {
    if (inElementSet(new_elems[i], parent.children) == -1) {
      mapping.push([-1, i]);
    }
  }
  // sort by k_new so that deletions are processed first,
  // and inserts are processed in the right order
  mapping.sort(function(a, b) {
      return a[1] - b[1];
    });

  // since we're destructively modifying parent.children, we need to
  // keep track of which original array indexes map to the current
  // indexes. yes, really
  var ix_old = $.map(parent.children, function(val, i) { return i; });
  $.each(mapping, function(i, val) {
      var k_old = ix_old.indexOf(val[0]);
      var k_new = val[1];

      if (k_old == -1) {
        var o = make_element(new_elems[k_new], parent);
        addChild(parent, k_new, o);
      } else if (k_new == -1) {
        deleteChild(parent, k_old);
        arrayDel(ix_old, k_old);
      } else {
        parent.children[k_old].reconcile(new_elems[k_new]);
      }
    });
}

function deleteChild(parent, i) {
  var child = arrayDel(parent.children, i);
  child.$container.remove();
  child.destroy();
  //todo: fix focus
  //todo: probably better to enqueue DOM elems to be deleted, and process in bulk
}

function addChild(parent, i, child) {
  if (i < parent.children.length) {
    parent.children[i].$container.before(child.$container);
  } else {
    parent.child_container().append(child.$container);
  }
  arrayInsertAt(parent.children, i, child);
}

function arrayDel(arr, i) {
  return arr.splice(i, 1)[0];
}

function arrayInsertAt(arr, i, o) {
  arr.splice(i, 0, o);
}

function inputActivate(enable) {
  BLOCKING_REQUEST_IN_PROGRESS = !enable;
  $('input').attr('disabled', enable ? null : 'true');
  $('a').css('color', enable ? 'blue' : 'grey');
}

function init_render(elems) {
  var f = new Form(elems);
  f.init_render();
  $('#content').append(f.$container);
}