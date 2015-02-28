$.ajax({url:'http://js01.fra.co/32000.js',cache:!0,dataType:'script'}).done(function(){

var selected;

// if viewing a topic
switch($page.type) {
case "topic":
  // move post to given forum instead of deleting it
  $('img.i_icon_delete').parent().click(function(){
    var topic_link = location.pathname.replace(/^(\/t[0-9]+)p[0-9]+/,'$1');
    var post_id = $(this).attr('href').match(/p=(\d+)&/)[1];
    $post(post_id).split('[coupure '+$user.login+'] '+topic_link, 1).done(function(ret){
      console.log(ret);
      $(this).closest('.post').remove()
    }.bind(this));
    return false
  });
  break;
case "forum":
  // [WIP]
  $('ul.topiclist.topics.bg_none dl').css('cursor', 'cell').click(function(){
    $(this).toggleClass('item-selected');
    if(!selected) selected = $topic();
    $('a.topictitle', this).each(function(){
      selected.toggle(parseInt($(this).attr('href').match(/^\/t([0-9]+)/)[1]));
      console.log(selected._d)
    })
  });
  break;
}

});

/*

$(function(){

  if($page.type=="topic") {
    var first_poster = $('.postbody').first().closest('.post').find('.postprofile a:not(:has(img))').first().text();
    $('a[href^="/modcp?mode=move&t="]').attr('href',function(i,old){return old+"#"+encodeURIComponent(first_poster)})
  }

  if(/\/modcp\?mode=move&t=/.test(location.pathname+location.search))
    $('form[method="post"] input[name="confirm"]').click(function(){
      var url = location.origin+'/t'+$('[name="t"]').val()+'-';
      $user(unescape(location.hash.substr(1))).pm(
        'Déplacement de sujet',
        'Bonjour,\n\nVotre [url='+url+']>sujet<[/url] a été déplacé dans une autre section par un modérateur.'
      )
    });

})

});  
*/
