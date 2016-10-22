($fa=window.$fa||$.ajax('//localhost/FA.js',{cache:!1,dataType:'script'})).done(function(){$(function(){

// send mail to opening poster when moving topic
var NOTIFY_OP_WHEN_MOVED = true;
var NOTIFY_MOVED_TITLE = 'Déplacement de sujet';
var NOTIFY_MOVED_MESSAGE = 'Bonjour,\n\nVotre [url={URL}]>sujet<[/url] a été déplacé dans une autre section par un modérateur.'

// move post to given forum instead of deleting it
var CUT_INSTEAD_OF_DELETE = true;
var CUT_FORUM_ID = 1;

var selected;

switch($fa.pagetype) {
// topic
case "topic":
  if(CUT_INSTEAD_OF_DELETE) {
    $('img.i_icon_delete').parent().click(function(){
      $post($fa.post(this)).split('[coupure '+$fa.username+'] '+location.pathname, CUT_FORUM_ID).done(function(){
        $(this).closest('.post').remove()
      }.bind(this));
      return false
    });
  }
  if(NOTIFY_OP_WHEN_MOVED) {
    var first_poster = $('.postbody').first().closest('.post').find('.postprofile a:not(:has(img))').first().text();
    $('a[href^="/modcp?mode=move&t="]').attr('href',function(_,old){return old+"#"+encodeURIComponent(first_poster)})
  }
  break;
// topic list
case "forum":
  // select list of topic
  $('ul.topiclist.topics.bg_none dl').css('cursor', 'cell').click(function(){
    $(this).toggleClass('fa-item-selected');
    if(!selected) selected = $topic();
    $('a.topictitle', this).each(function(){
      selected.toggle($fa.thread(this));
    });
  });
  break;
// topic move
case "move":
  if(NOTIFY_OP_WHEN_MOVED) {
    var first_poster = $('.postbody').first().closest('.post').find('.postprofile a:not(:has(img))').first().text();
    $('a[href^="/modcp?mode=move&t="]').attr('href',function(_,old){return old+"#"+encodeURIComponent(first_poster)})
  }
  $('form[method="post"] input[name="confirm"]').click(function(){
    var r = function(str){
      return $fa.replace({
        'url': location.origin+'/t'+$('[name="t"]').val()+'-',
        'poster': decodeURIComponent(location.hash.slice(1))
      }, str);
    };
    $user(r('{poster}')).replacing().pm(r(NOTIFY_MOVED_TITLE), r(NOTIFY_MOVED_MESSAGE));
  });
}

})});
