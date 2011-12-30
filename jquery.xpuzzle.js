(function($){
    function block(obj, idx){
        this.obj = obj;
        this.idx = idx;
    }
    function board(w, h, imgobj, container){
        this.w = w;
        this.h = h;
        this.myimg = imgobj
        this.blocks = new Array()
        this.containerDom = container;
        this.cursor = {
            i: 0,
            j: 0
        }
    }
    board.prototype.swap = function(a, b){
        idx1 = a.j * this.w + a.i
        idx2 = b.j * this.w + b.i
        b1 = this.blocks[idx1]
        b2 = this.blocks[idx2]
        b1_li = b1.obj
        b2_li = b2.obj
        var ti = b1_li.data('i')
        var tj = b1_li.data('j')
        b1_li.data('i', b2_li.data('i')).data('j', b2_li.data('j'))
        b2_li.data('i', ti).data('j', tj)
        var b1_lic = $(b1_li).clone(true)
        var b2_lic = $(b2_li).clone(true)
        $(b1_li).after(b2_lic).remove()
        $(b2_li).after(b1_lic).remove()
        b1.obj = b1_lic
        b2.obj = b2_lic
        this.blocks[idx1] = b2
        this.blocks[idx2] = b1
    }
    board.prototype.left = function(){
        if ((this.cursor['i'] + 1) >= this.w) 
            return false;
        this.swap({
            i: this.cursor['i'],
            j: this.cursor['j']
        }, {
            i: this.cursor['i'] + 1,
            j: this.cursor['j']
        })
        this.cursor['i'] += 1;
    }
    board.prototype.right = function(){
        if ((this.cursor['i'] - 1) < 0) 
            return false;
        this.swap({
            i: this.cursor['i'],
            j: this.cursor['j']
        }, {
            i: this.cursor['i'] - 1,
            j: this.cursor['j']
        })
        this.cursor['i'] -= 1
    }
    board.prototype.down = function(){
        if ((this.cursor['j'] - 1) < 0) 
            return false;
        this.swap({
            i: this.cursor['i'],
            j: this.cursor['j']
        }, {
            i: this.cursor['i'],
            j: this.cursor['j'] - 1
        })
        this.cursor['j'] -= 1
    }
    board.prototype.up = function(){
        if ((this.cursor['j'] + 1) >= this.h) 
            return false;
        this.swap({
            i: this.cursor['i'],
            j: this.cursor['j']
        }, {
            i: this.cursor['i'],
            j: this.cursor['j'] + 1
        })
        this.cursor['j'] += 1
    }
    $.getPuzzleSize = function(imgobj){
        var w = imgobj.width();
        var h = imgobj.height();
        var dimensions = new Array()
        for (row = 2; row < 9; row++) {
            for (col = 2; col < 9; col++) {
                if (w % row == 0 && h % col == 0) {
                    dimensions.push({
                        rows: row,
                        cols: col
                    })
                }
            }
        }
        return dimensions;
    }
    $.fn.xpuzzle = function(callerSettings){
        var settings = $.extend({
            rows: 0,
            cols: 0,
            keyboardOn: true,
            command: true,
            callback_left: function(){
            },
            callback_right: function(){
            },
            callback_up: function(){
            },
            callback_down: function(){
            },
            callback_score: function(){
            }
        }, callerSettings || {})
        var imgobj = $(this)
        var dimensions = $.getPuzzleSize(imgobj)
        var flag_sizeok = false
        $.each(dimensions, function(i, e){
            if (e.rows == settings.rows && e.cols == settings.cols) {
                flag_sizeok = true
            }
        })
        if (!flag_sizeok) {
            var dimension = dimensions[0]
            settings.rows = dimension.rows
            settings.cols = dimension.cols
        }
        var imgobjId = imgobj[0].id
        var imgurl = imgobj[0].src
        var containerDiv = $("<div id='" + imgobj[0].id + "'></div>")
        var myboard = new board(settings.rows, settings.cols, imgobj, containerDiv);
        var img_w = myboard.myimg.width();
        var img_h = myboard.myimg.height();
        var box_w = Math.ceil(img_w / myboard.w);
        var box_h = Math.ceil(img_h / myboard.h);
        var rn = Math.floor(Math.random() * (myboard.w * myboard.h));
        var blocks = new Array();
        var boardWidth = 8 * myboard.w + myboard.myimg.width()
        var boardHeight = 8 * myboard.h + myboard.myimg.height()
        myboard.cursor['j'] = Math.floor(rn / myboard.w);
        myboard.cursor['i'] = rn % myboard.w;
        containerDiv.css("width", boardWidth).css("height", boardHeight);
        containerDiv.css("background-color", 'white')
        $(this).after(containerDiv)
        $("<ul id='puzzleBoard'></ul>").css('list-style-type', 'none').css('margin', 0).css('padding', '0').appendTo(containerDiv);
        $(this).remove()
        for (j = 0; j < myboard.h; j++) {
            for (i = 0; i < myboard.w; i++) {
                var obj = $("<li id='block_" + i + "|" + j + "' class='block' style='float:left;'></li>")
                obj.data('i', i);
                obj.data('j', j);
                blocks.push(obj)
            }
        }
        $.each(blocks, function(i, e){
            offsetX = (e.data('i') * box_w);
            offsetY = (e.data('j') * box_h);
            e.data('idx', i).css("width", box_w).css("height", box_h).css("margin", '1px').css("color", "white").css('border-style', 'solid').css('border-width', '1px').css('border-color', 'black');
            
            
            $(myboard.containerDom).children('#puzzleBoard').append(e)
            if (myboard.cursor['i'] == e.data('i') && myboard.cursor['j'] == e.data('j')) {
                e.css("background-color", "white");
                e.css("border-color", 'white')
            }
            else {
                e.click(function(event){
                    $(this).css('border-color', 'black')
                    var bi = $(this).data('i')
                    var bj = $(this).data('j')
                    var ci = myboard.cursor['i']
                    var cj = myboard.cursor['j']
                    //alert('('+ci+', '+cj+') ('+bi+', '+bj+')')
                    if (cj == bj && ci + 1 == bi) {
                        $(myboard.containerDom).trigger('command', 'L')
                    }
                    if (cj == bj && ci - 1 == bi) {
                        $(myboard.containerDom).trigger('command', 'R')
                    }
                    if (cj + 1 == bj && ci == bi) {
                        $(myboard.containerDom).trigger('command', 'U')
                    }
                    if (cj - 1 == bj && ci == bi) {
                        $(myboard.containerDom).trigger('command', 'D')
                    }
                })
                e.mouseover(function(){
                    $(this).css('border-color', 'red')
                    
                }).mouseout(function(){
                    $(this).css('border-color', 'black')
                })
                e.css("background-image", "url(" + imgurl + ")");
                e.css("background-position", "-" + offsetX + "px" + " -" + offsetY + "px")
            }
            var myblock = new block(e, i)
            myboard.blocks.push(myblock)
        })
        
        if (settings.command) {
            $(containerDiv).bind('command', function(ev, cmdstr){
                $.each(cmdstr, function(i, cmd){
                    if (cmd == 'L') {
                        myboard.left();
                        settings.callback_left();
                    }
                    if (cmd == 'U') {
                        myboard.up();
                        settings.callback_up();
                    }
                    if (cmd == 'R') {
                        myboard.right();
                        settings.callback_right();
                    }
                    if (cmd == 'D') {
                        myboard.down();
                        settings.callback_down();
                    }
                    if (cmd == 'S') {
                        settings.callback_score(34);
                    }
                })
            })
        }
        
        $(document).keydown(function(event){
            if (settings.keyboardOn) {
                event.preventDefault();
                if (event.keyCode == '37') 
                    $(myboard.containerDom).trigger('command', 'L')
                if (event.keyCode == '38') 
                    $(myboard.containerDom).trigger('command', 'U')
                if (event.keyCode == '39') 
                    $(myboard.containerDom).trigger('command', 'R')
                if (event.keyCode == '40') 
                    $(myboard.containerDom).trigger('command', 'D')
            }
        })
        

    }
})(jQuery)






