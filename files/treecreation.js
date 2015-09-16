<!--

/* Why are you looking at this? You actually want to try and do something to    *
*  help this poor project???  Well... I feel bad for you but if you really are  *
*  up to the challenge then be my guest.  I'm not going to take a way the       *
*  the opportunity for you to slam you head against the wall, agonizing from    *
*  the ridiculous javascript below this opening statement.  It's not too late   *
*  to turn back!  Just close this project and look for a new one!!! No?  ok...  *
*  well I documented this to the "best" of my ability but you still will need   *
*  some patience in order to deal with this project.  It is in no way clean and *
*  everything was done with the sole intention of simply "getting the job done."*
*  If you have not read my project notes file, that would be a great place to   *
*  start to try and understand what's going on here, otherwise... good luck!    */


/*{ First off lets declare some global variables cause this is javascript and it doesn't
really matter.

    firstnode     - This is the first node object, its visual counterpart is
                  permanently on the screen as "#0".  Each node object keeps
                  track the node's statement, whether it is open or closed, and
                  the checks that the node has.
    tree          - This is an array of node objects, the backbone to the whole program
    bottomnodes   - This is used mainly in deletemode in order to keep track of the
                  leaf nodes in the tree i.e. the ones that have no children
    naming        - This keeps track of the current name, it is incremented by one
                  for each new node created
    beingchecked  - This is used to keep track of a node currently being checked for
                  something
    statementhold - This is used to keep track of a statement currently being checked
    initializesize- This keeps track of the size the screen was initialially set to}*/

var firstnode = {name:"0", statement:"", open:false, closed:false, checks:[], kids:[]};
var tree = [firstnode];
var loadtree = [];
var bottomnodes = [];
var naming = 0;
var beingchecked;
var statementhold;
var initialsize = $('html').width();
var deletewarning = 0;


/* This section initially hides certain HTML objects to begin with*/

$('.aform').hide();
$('.displaystate').hide();
$('.addcheck').hide();
$('.add').hide();
$('.remove').hide();
$('.done').hide();
$('.delete').hide();
$('.checksalt').hide();
$('#loadform').hide();



/* Easily the most helpful function to you in this whole damn file, this
    prints out the tree... more specifically the node names and checks
    associated with them*/

function printtree()
{
    for (var i = 0; i < tree.length; i++)
    {
        console.log(tree[i].name+" | "+tree[i].statement)
        console.log(tree[i].checks)
    }
}


/* This function checks whether a statement is of valid form, like if it makes
sense... because if someone puts in three parenthesis and 3 and symbols... that
doesn't make sense. Essentailly this can be divided into two loops, the first
checks for incorrect symbol format, and the second checks for correct parenthesis
use.  As of now, any symbols that aren't logic symbols are assumed to be part of
the variables.

anewstring            - holds a new string created by the first check loop
lastlit               - holds the the last literal checked in the statement
lastsym               - holds the last connective checked in the statement
dubstates             - changed to one if there is a problem with the variables
dubsyms               - changed to one if there is a problem with the symbols

first loop            - checks if there are 2 (or more) symbols next to each
                        other that should be, also checks if there are two
                        variables together

pardep                - holds the current parenthesis depth in the statement
                        ex: ((H)B) 'H' is at depth 2 and B is at depth 1
symperpar             - keeps track of the number of connectives per depth

second loop           - tries to make sure that there is not an 'and' and 'or'
                        or 'cond' and 'bicon' at the same depth which would
                        make the statement ambiguous

final if/then         - checks to make sure all parenthesis that were opened
                        got closed
*/

function checkcorrectness(statement)
{
    var anewstring = "";
    var lastlit = "";
    var lastsym = "";
    var dubstates = 0;
    var dubsyms = 0;
    for (var i = 0; i < statement.length; i++)
    {
        if (statement[i] == "↔" || statement[i] == "→" || statement[i] == "∧"
        || statement[i] == "∨" || statement[i] == "¬" || statement[i] == "("
        || statement[i] == ")")
        {
            if (dubsyms == 1 && statement[i] != "(" && statement[i] != "¬" && lastsym != ")")
            {
                return false;

            }
            if (i == 0 && statement[i] != "(" && statement[i] != "¬"
            || i == statement.length-1 && statement[i] != ")")
            {
                return false;
            }
            anewstring = anewstring + statement[i];
            lastsym = statement[i];
            dubsyms = 1;
            lastlit = "";
            dubstates = 0;
        }
        else
        {
            if (statement[i] == " ")
            {
                if (lastlit != "")
                {
                    dubstates = 1;
                }
            }
            else if (dubstates == 1)
            {
                return false;
            }
            else
            {
                lastlit = statement[i];
                dubsyms = 0;
            }
        }
    }

    var pardep = 0;
    var symperpar = [[0,0,0,0]];
    for (var i = 0; i < anewstring.length; i++)
    {
        if (anewstring[i] == "(")
        {
            pardep++;
            if (symperpar.length - 1 < pardep)
            {
                symperpar.push([0,0,0,0]);
            }
            else
            {
                symperpar[pardep][0] = 0;
                symperpar[pardep][1] = 0;
                symperpar[pardep][2] = 0;
                symperpar[pardep][3] = 0;
            }
        }
        else if (anewstring[i] == ")")
        {
            pardep--;
        }
        else if (anewstring[i] == "∧")
        {
            symperpar[pardep][0] = symperpar[pardep][0] + 1;
        }
        else if (anewstring[i] == "∨")
        {
            symperpar[pardep][1] = symperpar[pardep][1] + 1;
        }
        else if (anewstring[i] == "→")
        {
            symperpar[pardep][2] = symperpar[pardep][2] + 1;
        }
        else if (anewstring[i] == "↔")
        {
            symperpar[pardep][3] = symperpar[pardep][3] + 1;
        }
        for (var j = 0; j < symperpar.length; j++)
        {
            if (symperpar[j][0] > 0 && symperpar[j][1] > 0)
            {
                return false;
            }
            if (symperpar[j][2] > 0 && symperpar[j][3] > 0)
            {
                return false;
            }
        }
    }
    if (pardep != 0)
    {
        return false;
    }
    return true;
}


/* This function checks to make sure that the 'checks' for a statement all branch,
should be used for statements such as (A or B)

numchecks             - the number of checks
checksout             - a boolean to check sets of checks
allpaths              - holds all of the possible paths
checksfound           - keeps track of the number of checks found so far in a
                        sub branch
dubsyms               - changed to one if there is a problem with the symbols

the loop              - starts at the greenhouse and goes down each branch
                        looking for checks, if it can't find more than one check
                        in a sub branch, then it returns true... like if there is
                        a 'branchl' that branches into a branchr and branchl then
                        it makes sure that there are not two checks in the 'branchl'
                        itself not including its sub branches
*/

function checkforbranch(checks)
{
    var numchecks = checks.length;
    var checksout = false;
    var allpaths = [];
    allpaths.push($('#greenhouse'));
    while (true)
    {
        var checksfound = 0;
        for (var i = 0; i < checks.length; i++)
        {
            if (allpaths[0].children('#'+checks[i]).length == 1)
            {
                checksfound++;
                numchecks--;
            }
        }
        if (checksfound == 1)
        {
            if (numchecks == 0 &&  allpaths.length == 1)
            {
                return true;
            }
            else if (allpaths.length == 1)
            {
                return false;
            }
            else
            {
                allpaths.shift();
            }
        }
        else
        {
            if (checksfound > 0)
            {
                return false;
            }
            else if (allpaths[0].children(".branchl").length == 1)
            {
                allpaths.push(allpaths[0].children(".branchl"));
                allpaths.push(allpaths[0].children(".branchr"));
                allpaths.shift();
            }
            else
            {
                if (numchecks == 0 && allpaths.length == 1)
                {
                    return true;
                }
                else if (allpaths.length == 1)
                {
                    return false;
                }
                else
                {
                    allpaths.shift();
                }
            }
        }
    }
}


/* Very similar to check for branch but makes sure the checks to a statement
    don't branch.  This should probably be combined with check for branch
    because they are pretty much the same.
*/

function checkfornobranch(checks)
{
    var numchecks = checks.length;
    var checksout = false;
    var allpaths = [];
    allpaths.push($('#greenhouse'));
    while (true)
    {
        var checksfound = 0;
        for (var i = 0; i < checks.length; i++)
        {
            if (allpaths[0].children('#'+checks[i]).length == 1)
            {
                checksfound++;
                numchecks--;
            }
        }
        if (checksfound == 2)
        {
            if (numchecks == 0 &&  allpaths.length == 1)
            {
                return true;
            }
            else if (allpaths.length == 1)
            {
                return false;
            }
            else
            {
                allpaths.shift();
            }
        }
        else
        {
            if (checksfound > 0)
            {
                return false;
            }
            else if (allpaths[0].children(".branchl").length == 1)
            {
                allpaths.push(allpaths[0].children(".branchl"));
                allpaths.push(allpaths[0].children(".branchr"));
                allpaths.shift();
            }
            else
            {
                if (numchecks == 0 && allpaths.length == 1)
                {
                    return true;
                }
                else if (allpaths.length == 1)
                {
                    return false;
                }
                else
                {
                    allpaths.shift();
                }
            }
        }
    }
}


/* Because if and only if is such a weird case, this function divides up
   the if and only if checks and sends them to the checkforbranch and
   checkforno branch functions.  It accepts 4 arguments: the checks for a
   biconditional statement, the "p" and "q" of the checks (as opposed to
   'not p' and 'not q', and a boolean isif that tells whether the biconditional
   is enclosed in a not... like not(A <-> B) = false.

the arrays            - hold various checks based on the array name

*/
function checkifonlyif(checks, statea, stateb, isif)
{
    var statepnotq = [];
    var stateqnotp = [];
    var statepnotp = [];
    var stateqnotq = [];
    var statepandq = [];
    var statenotpnotq = [];
    var p = statea;
    var q = stateb;

    for (var i = 0; i < checks.length; i++)
    {
        var tempnode = getanode(tree, checks[i]);
        var tempstate = removespace(tempnode.statement);
        if (tempstate == "¬" + p || tempstate == "¬(" + p +")")
        {
            stateqnotp.push(checks[i]);
            statepnotp.push(checks[i]);
            statenotpnotq.push(checks[i]);
        }
        else if (tempstate == "¬" + q || tempstate == "¬(" + q +")")
        {
            statepnotq.push(checks[i]);
            stateqnotq.push(checks[i]);
            statenotpnotq.push(checks[i]);
        }
        else if (tempstate == p)
        {
            statepnotq.push(checks[i]);
            statepnotp.push(checks[i]);
            statepandq.push(checks[i]);
        }
        else
        {
            stateqnotp.push(checks[i]);
            stateqnotq.push(checks[i]);
            statepandq.push(checks[i]);
        }
    }
    if (checkforbranch(statepnotp) == true
    && checkforbranch(stateqnotq) == true
    && checkfornobranch(statepnotq) == true
    && checkfornobranch(stateqnotp) == true
    && isif == false)
    {
        return true;
    }
    else if (checkfornobranch(statenotpnotq) == true
    && checkfornobranch(statepandq) == true
    && checkforbranch(statepnotq) == true
    && checkforbranch(stateqnotp) == true
    && isif == true)
    {
        return true;
    }
    else
    {
        return false;
    }
}


/* This function makes sure that all nodes in the tree are checked of
   unless they are in the very top of the tree (greenhouse branch).  If not
   it colors them light blue.
*/

function checktreestructure()
{
    var allchecks = [];
    for (var i = 0; i < tree.length; i++)
    {
        for (var j = 0; j < tree[i].checks.length; j++)
        {
            if (allchecks.indexOf(tree[i].checks[j]) == -1)
            {
                allchecks.push(tree[i].checks[j]);
            }
        }
    }
    var sound = true;
    for (var i = 0; i < tree.length; i++)
    {
        var checkid = '#' + tree[i].name;
        if ($(checkid).parent().attr('id') != "greenhouse")
        {
            var test = false;
            for (var j = 0; j < allchecks.length; j++)
            {
                if (tree[i].name == allchecks[j])
                {
                    test = true;
                    continue;
                }
            }
            if (test == false)
            {
                sound = false;
                $(checkid).css({"background-color":"rgb(204, 255, 255)"});
            }
        }
    }
    if (sound == false)
    {
        return false;
    }
    return true;
}


/* This function takes a statement and removes the spaces from it so that it
can be parsed easier.  Then it attempts to remove excess parenthesis from the
outside of the statement.  Like (A) becomes A
*/

function removespace(astring)
{
    var anewstring = "";
    for (var i = 0; i < astring.length; i++)
    {
        if (astring[i] != " ")
        {
            anewstring = anewstring + astring[i];
        }
    }
    astring = anewstring;

    while (astring[0] == "(" && astring[astring.length-1] == ")")
    {
        var parpairs = [];
        for (var i = 1; i < astring.length-1; i++)
        {
            if (astring[i] == "(")
            {
                parpairs.push(true);
            }
            else if (astring[i] == ")")
            {
                var closed = false;
                for (var j = 0; j < parpairs.length; j++)
                {
                    if (parpairs[j] == true)
                    {
                        parpairs[j] = false;
                        closed = true;
                    }
                }
                if (closed == false)
                {
                    return astring;
                }
            }
        }
        astring = astring.substr(1,astring.length-2);
    }
    return astring;
}


/* This function takes a list of statements and returns a list of unique statements
   (in other words it removes duplicates).  Also this function will check to make
   sure that there are no more of one unique statement than another and will return
   'unbalanced' if there is.

diffstates   - an array of the different statements
diffnum               - holds the number of each type of statement
*/

function uniquestatements(checks)
{
    var diffstates = [];
    var diffnum = [];
    for (var i = 0; i < checks.length; i++)
    {
        var acheck = getanode(tree, checks[i]);
        var acheckstate = removespace(acheck.statement);
        var checksout = false;
        for (var j = 0; j < diffstates.length; j++)
        {
            if (acheckstate == diffstates[j])
            {
                checksout = true;
                diffnum[j]++;
            }
        }
        if (checksout == false)
        {
            diffstates.push(acheckstate);
            diffnum.push(1);
        }
    }
    for (var i = 0; i < diffstates.length; i++)
    {
        var balanced = diffnum[0];
        if (balanced != diffnum[i])
        {
            diffstates[0] = "unbalanced";
        }
    }
    return diffstates;
}


/* This function updates the kids (children) for each node in the tree array.  This is only
   called when saving, or when grading... I think.  The rest of the tree array
   is updated as the program goes, but because of deletes and stuff, it is easier
   just to make this one a separate function.  BTW kids are the node/s directly
   below a node, so there can only be zero, one or two kids.
*/

function updatekids()
{
    for (var i = 0; i < tree.length; i++)
    {
        checkid = "#" + tree[i].name;
        if ($(checkid).next().attr('class') == "node")
        {
            tree[i].kids = [$(checkid).next().attr('id')];
        }
        else if ($(checkid).next().attr('class') == "branchl")
        {
            var child1 = $(checkid).siblings(".branchl").find('.node').first().attr('id');
            var child2 = $(checkid).siblings(".branchr").find('.node').first().attr('id');
            tree[i].kids = [child1, child2];
        }
        else
        {
        }
    }
}


/* This function is called after a branch is added that makes the tree too wide
to fit into the screen.  It will expand all of the branches.  It is recursive
and takes a branch, and the amount of added width needed
as arguments.  It will widen the branch, move the branch next to it,
 and then call widen on the parent branch until it hits the greenhouse.
*/

function widen(element, addedwidth)
{
    if (element.attr('class') == "branchl")
    {
        var temp = element.width() + addedwidth;
        element.css({"width":temp, "position":"absolute"});
        temp = temp + 4;
        element.next().css({"margin-left":temp});
        widen(element.parent(), addedwidth);
    }
    else if (element.attr('class') == "branchr")
    {
        var temp = element.width() + addedwidth;
        var temp2 = element.prev().width()+4;
        element.css({"width":temp, "position":"absolute", "margin-left":temp2});
        widen(element.parent(), addedwidth);
    }
    else
    {
        var temp = (($("#greenhouse").children(".branchl").first().width() + $("#greenhouse").children(".branchr").first().width()) - $("#greenhouse").width());
        $("#greenhouse").children(".node").css({"margin-left":temp});
    }
}


/* A simple function yay! This one takes a name of a node and a statement and
   then updates that node's statement in the tree array.
*/

function editnodestate(aname, statement)
{
    for (var i = 0; i < tree.length; i++)
    {
        if (tree[i].name === aname)
        {
            tree[i].statement = statement;
        }
    }
}


/* This function needs to be more efficient.  It is called a lot when you load
   a tree file.  It takes an oldname of a node and updates it to a new name
   but unfortunately it has to update the checks too, and kids, and it has to
   make sure that there are no nodes that are already called the new name.
   Takes a tree as an argument as well because it sometimes takes the load tree
   and sometimes takes the regular tree.
*/

function editnodename(atree, oldname, newname)
{
    var largestname = 0;
    for (var i = 0; i < atree.length; i++)
    {
        if (parseInt(atree[i].name) > largestname)
        {
            largestname = parseInt(atree[i].name);
        }
    }
    largestname++;
    for (var i = 0; i < atree.length; i++)
    {
        if (atree[i].name === newname)
        {
            console.log(atree[i].name, newname, largestname);
            atree[i].name = (largestname).toString();
        }
        else if (atree[i].name === oldname)
        {
            atree[i].name = newname;
        }
        for (var j = 0; j < atree[i].checks.length; j++)
        {
            if (atree[i].checks[j] === newname)
            {
                atree[i].checks[j] = (largestname).toString();
            }
            if (atree[i].checks[j] === oldname)
            {
                atree[i].checks[j] = newname;
            }
        }
        for (var j = 0; j < atree[i].kids.length; j++)
        {
            if (atree[i].kids[j] === newname)
            {
                atree[i].kids[j] = (largestname).toString();
            }
            if (atree[i].kids[j] === oldname)
            {
                atree[i].kids[j] = newname;
            }
        }
    }
}


/* Takes a name, returns the node in the tree array.
*/

function getanode(atree, aname)
{
    for (var i = 0; i < atree.length; i++)
    {
        if (atree[i].name === aname)
        {
            return atree[i];
        }
    }
}


/* This determines if the connective evaluated was the next symbol that should
have been evaluated.  Pardep keeps track of the parenthesis depth (see checkcorrectness)
and the symtoevals keep track of the symbols to be evaluated.  Symtoeval is updated
if there are any symbols to evaluate at depth 0, and Symtoeval2 at depth 1.
*/

function nextsymtoeval(sym, statement)
{
    var pardep = 0;
    var symtoeval = "";
    var symtoeval2 = "";
    for (var i = 0; i < statement.length; i++)
    {
        if (statement[i] == "(")
        {
            pardep++;
        }
        else if (statement[i] == ")")
        {
            pardep--;
        }
        else if (pardep == 0)
        {
            if (statement[i] == "→")
            {
                symtoeval = "→";
            }
            else if (statement[i] == "↔")
            {
                symtoeval = "↔";
            }
            else if (statement[i] == "∧" && symtoeval == "")
            {
                symtoeval = "∧";
            }
            else if (statement[i] == "∨" && symtoeval == "")
            {
                symtoeval = "∨";
            }
        }
        else if (pardep == 1)
        {
            if (statement[i] == "→")
            {
                symtoeval2 = "→";
            }
            else if (statement[i] == "↔")
            {
                symtoeval2 = "↔";
            }
            else if (statement[i] == "∧" && symtoeval2 == "")
            {
                symtoeval2 = "∧";
            }
            else if (statement[i] == "∨" && symtoeval2 == "")
            {
                symtoeval2 = "∨";
            }
        }
    }
    if (symtoeval != "")
    {
        if (sym == symtoeval)
        {
            return true;
        }
    }
    else
    {
        if (sym == symtoeval2)
        {
            return true;
        }
    }
    return false;
}


/* This function simply looks for certain connective symbols and returns
   true or false depending on if it finds one.
*/

function containsconnect(astate)
{
    if (astate.search("∧") != -1
    || astate.search("∨") != -1
    || astate.search("→") != -1
    || astate.search("↔") != -1)
    {
        return true;
    }
    else false;
}


/* This function compares two checks to a statement, and sees if they correctly
   add up to the statement when you put the symbol between them.  This should be
   a simple task but because of FUCKING PARENTHESIS it's not. The function takes
   5 arguments: the two checks, the full statement, the symbol that was eliminated
   and a boolean whether the statement being broken down was positive or negative.

   This function is extremely important and while I've done a bit of testing,
   there still may be errors cause who knows what idiots may throw into nodes.
   Check the presentations on how to break down statements correctly and then
   try to think if I am missing anything.  I'm done slamming my head against my
   desk thinking about this.
*/

function comparestatements(statea, stateb, statec, sym, neg)
{
    if (neg == false)
    {
        if (statea + sym + stateb == statec
            || stateb + sym + statea == statec
            || statea + sym + "(" + stateb + ")" == statec
            || stateb + sym + "(" + statea + ")" == statec
            || "(" + statea + ")" + sym + stateb == statec
            || "(" + stateb + ")" + sym + statea == statec
            || "(" + statea + ")" + sym + "(" + stateb + ")" == statec
            || "(" + stateb + ")" + sym + "(" + statea + ")" == statec)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        if ("¬("+statea+ sym +stateb+")"==statec
        || "¬("+stateb+ sym +statea+")"==statec)
        {
            return true;
        }
        if (containsconnect(statea) == true)
        {
            if ("¬(("+statea+")"+sym+stateb+")"==statec
            || "¬("+stateb+sym+"("+statea+"))"==statec)
            {
                return true;
            }
        }
        if (containsconnect(stateb) == true)
        {
            if ("¬("+statea+sym+"("+stateb+"))"==statec
            || "¬(("+stateb+")"+sym+statea+")"==statec)
            {
                return true;
            }
        }
        if (containsconnect(statea) == true
            &&containsconnect(stateb) == true)
        {
            if("¬(("+stateb+")"+sym+"("+statea+"))"==statec
            || "¬(("+statea+")"+sym+"("+stateb+"))"==statec)
            {
                return true;
            }
        }
        return false;
    }
}


/* Same as comparestatements but because conditionals are weird they get their
own function.  Note that biconditional uses the compare statement function
... conditionals are only one that doesn't. (see gradework).
*/

function comparestatementscond(statea, stateb, statec, neg)
{
    if (neg == false)
    {

        if (statea.substr(1) +"→"+stateb == statec
        || statea.substr(1)+"→("+stateb+")" == statec
        || stateb.substr(1) + "→"+statea == statec
        ||stateb.substr(1)+"→("+statea+")" == statec)
        {
            return true;
        }
        if (containsconnect(statea) == false)
        {
            if("("+statea.substr(1)+")→"+stateb == statec
            || "("+statea.substr(1)+")→("+stateb+")" == statec)
            {
                return true;
            }
        }
        if (containsconnect(stateb) == false)
        {
            if("("+stateb.substr(1)+")→"+statea == statec
            ||"("+stateb.substr(1)+")→("+statea+")" == statec)
            {
                return true;
            }
        }
        return false;
    }
    else
    {
        console.log(statea, stateb, statec);

        if ("¬("+stateb+"→"+statea.substr(1)+")"==statec
        ||"¬("+statea+"→"+stateb.substr(1)+")"==statec
        ||"¬(("+statea+")→"+stateb.substr(1)+")"==statec
        ||"¬(("+stateb+")→"+statea.substr(1)+")"==statec)
        {
            return true;
        }
        if (containsconnect(statea) == false)
        {
            if ("¬("+stateb+"→("+statea.substr(1)+"))"==statec
            || "¬(("+stateb+")→("+statea.substr(1)+"))"==statec)
            {
                return true;
            }
        }
        if (containsconnect(stateb) == false)
        {
            if ("¬("+statea+"→("+stateb.substr(1)+"))"==statec
            || "¬(("+statea+")→("+stateb.substr(1)+"))"==statec)
            {
                return true;
            }
        }
        return false;
    }
}


/* This function checks if a closed statement was correctly closed.  It does this
by looking at the statement that was closed, and going through the parent containers
until it finds a contradicting statement.  If it finds a contradiction then the closed
node turns gree, otherwise it turns red. Unfortunately as of now you must have both
statements down to literals (fully evaluated) before you can tell if they are a contradiction.

foundcon              - boolean that checks if a contradiction was found
parents               - holds a parent container being checked
*/

function checkclosed(checkid, checkstate)
{
    var parents = $(checkid).parent();
    var foundcon = false;
    while (parents.attr('id') != $('#container').attr('id'))
    {
        var anode;
        for (var j = 0; j < parents.find('.node').length; j++)
        {
            if (j == 0)
            {
                anode = parents.find('.node').first();
            }
            else
            {
                anode = anode.next();
            }
            if (anode.attr('class') == "node")
            {
                var astate = removespace(anode.find('.displaystate').text());
                if (astate == "¬" + checkstate
                || astate == "¬(" + checkstate + ")"
                || "(" + astate + ")" == "¬" + checkstate
                || "(" + astate + ")" == "¬(" + checkstate + ")"
                || checkstate == "¬" + astate
                || checkstate == "¬(" + astate + ")"
                || "(" + checkstate + ")" == "¬" + astate)
                {
                    if (containsconnect(astate) != true
                    && containsconnect(checkstate) != true)
                    {
                        foundcon = true;
                    }
                }
            }
        }
        parents = parents.parent();
    }
    if (foundcon == true)
    {
        $(checkid).css({"background-color":"rgb(0, 200, 0)"});
    }
    else
    {
        $(checkid).css({"background-color":"red"});
    }
}


/* This function checks if an open statement is correctly left open by
attempting to find contradictions for all of the parent nodes.  It also
looks to see if any statement have not been evaluated by looking for conenctives
and also for double not signs.

foundnonev            - boolean that checks if a non evaluated statement
                        or contracdicting literal was found
parents               - holds a parent container being checked
*/

function checkopen(checkid, checkstate)
{
    var parents = $(checkid).parent();
    var foundnonev = false;
    var othercontra = [];
    while (parents.attr('id') != $('#container').attr('id'))
    {
        var anode;
        for (var j = 0; j < parents.children('.node').length; j++)
        {
            if (j == 0)
            {
                anode = parents.find('.node').first();
            }
            else
            {
                anode = anode.next();
            }
            if (anode.attr('class') == "node")
            {
                var astate = removespace(anode.find('.displaystate').text());
                othercontra.push(astate);
                if (anode.css("background-color") != "rgb(0, 200, 0)")
                {
                    if (astate.search("¬¬") != -1
                    || astate.search('¬\\(¬') != -1
                    || astate.search("∧") != -1
                    || astate.search("∨") != -1
                    || astate.search("→") != -1
                    || astate.search("↔") != -1)
                    {
                        foundnonev = true;
                    }
                    for (var k = 0; k < othercontra.length; k++)
                    {
                        if (astate == "¬" + othercontra[k]
                        || astate == "¬(" + othercontra[k] + ")"
                        || "(" + astate + ")" == "¬" + othercontra[k]
                        || "(" + astate + ")" == "¬(" + othercontra[k] + ")"
                        || othercontra[k] == "¬" + astate
                        || othercontra[k] == "¬(" + astate + ")"
                        || "(" + othercontra[k] + ")" == "¬" + astate
                        || "(" + othercontra[k] + ")" == "¬(" + astate + ")")
                        {
                            if (containsconnect(astate) == false)
                            {
                                foundnonev = true;
                            }
                        }
                    }
                    if (astate == "¬" + checkstate
                    || astate == "¬(" + checkstate + ")"
                    || "(" + astate + ")" == "¬" + checkstate
                    || "(" + astate + ")" == "¬(" + checkstate + ")"
                    || checkstate == "¬" + astate
                    || checkstate == "¬(" + astate + ")"
                    || "(" + checkstate + ")" == "¬" + astate
                    || "(" + checkstate + ")" == "¬(" + astate + ")")
                    {
                        if (containsconnect(astate) == false)
                        {
                            foundnonev = true;
                        }
                    }
                }
            }
        }
        parents = parents.parent();
    }
    if (foundnonev == true)
    {
        $(checkid).css({"background-color":"red"});
    }
    else
    {
        $(checkid).css({"background-color":"rgb(0, 200, 0)"});
    }
}


/* This function takes a node and its checks and makes sure that the checks
   are correctly distributed in the branches below.
*/

function checkbalance(aname, checks)
{
    var allpaths = [$('#'+aname)];
    while (allpaths.length != 0)
    {
        var foundcheck = false;
        for (var i = 0; i < checks.length; i++)
        {
            if (allpaths[0].children('#'+checks[i]).length > 0)
            {
                foundcheck = true;
            }
        }
        if (foundcheck == true)
        {
            allpaths.shift();
        }
        else
        {
            if (allpaths[0].children(".node").last().find('.close').css("float") != "left")
            {
                allpaths.pop();
            }
            else if (allpaths[0].children(".node").last().find('.open').css("float") != "left")
            {
                return false;
            }
            else
            {
                if (allpaths[0].find('.branchl').length != 0)
                {
                    allpaths.push(allpaths[0].children('.branchl'));
                    allpaths.push(allpaths[0].children('.branchr'));
                }
                else
                {
                    return false;
                }
                allpaths.shift();
            }
        }
    }
    return true;
}


/* This was necessary for the load save events, I don't know what it does cause
   I took it from some site... but feel free to look at it.
*/

function destroyelement(event)
{
    document.body.removeChild(event.target);
}


/* Upon load, this statement will look at the load tree and attempt to create
   the tree... by calling the events you would to normally create it.  Only
   difference is that when you create a tree this way, it renumbers the nodes
   so that the numbering is perfect, whereas if you delete a node and create a
   a node, will skip numbers you deleted.  For the most part the function is self
   explanatory, it checks each node in loadtree... if they node exists then it fills
   in the information and then creates the child node/s depending on if there are
   any kids.  Then it checks to make sure the child nodes it creates have the same
   name as the kids do, and if not it updates the name of the kids and checks and
   node to the name of the newly created node.
*/

function createtree()
{
    for (var i = 0; i < loadtree.length; i++)
    {
        var checkid = "#" + loadtree[i].name;
        if ($('#greenhouse').find(checkid).length == 0)
        {
            var temp = loadtree[i];
            loadtree.splice(i,1);
            loadtree.push(temp);
            i--;
        }
        else
        {
            $(checkid).find('.clickhere').click();
            $(checkid).find('.statement').val(loadtree[i].statement);
            $(checkid).find('.statement').submit();
            if (loadtree[i].kids.length == 1)
            {
                $(checkid).find('.single').click();
                if ($(checkid).next().attr('id') != loadtree[i].kids[0])
                {
                    console.log(loadtree[i].name);
                    editnodename(loadtree, loadtree[i].kids[0], $(checkid).next().attr('id'));
                }
            }
            else if (loadtree[i].kids.length == 2)
            {
                $(checkid).find('.double').click();
                if ($(checkid).siblings('.branchl').find('.node').first().attr('id') != loadtree[i].kids[0])
                {
                    console.log(loadtree[i].name);
                    editnodename(loadtree, loadtree[i].kids[0],$(checkid).siblings('.branchl').find('.node').first().attr('id'));
                }
                if ($(checkid).siblings('.branchr').find('.node').first().attr('id') != loadtree[i].kids[1])
                {
                    console.log(loadtree[i].name);
                    editnodename(loadtree, loadtree[i].kids[1], $(checkid).siblings('.branchr').find('.node').first().attr('id'));
                }
            }
            else
            {

            }
        }
    }
    for (var i = 0; i < loadtree.length; i++)
    {
        var checkid = '#' + loadtree[i].name;
        $(checkid).find('.addcheck').click();
        for (var j = 0; j < loadtree[i].checks.length; j++)
        {
            var addid = '#' + loadtree[i].checks[j];
            $(addid).find('.add').click();
        }
        $(checkid).find('.done').click();
        if (loadtree[i].open == true)
        {
            $(checkid).find('.open').click();
        }
        if (loadtree[i].closed == true)
        {
            $(checkid).find('.close').click();
        }
    }
    loadtree.length = 0;
}


/* For the most part I don't know what is going on with save, upload and load...
I took them from websites.  But generally these three just convert the tree of
node objects into JSON and then writes that to a blob that is downloaded.  For
upload it takes the uploaded item and parses it back into javascipt.  (see
this website for more information: https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
*/

$('#header').on('click', '#save', function()
{
    var filename = "my_tree.tree";
    if ($('#savefile').val() != "")
    {
        var aname = $('#savefile').val();
        filename = aname +".tree";
    }
    updatekids();
    var treetext = JSON.stringify(tree);
    var ablob = new Blob ([treetext], {type:'text/plain'});
    var link = document.createElement("a");
    link.download = filename;
    link.innerHTML = "Download File";
    if (window.webkitURL != null)
    {
        link.href = window.webkitURL.createObjectURL(ablob);
    }
    else
    {
        link.href = window.URL.createObjectURL(ablob);
        link.onclick = destroyelement;
        link.style.display = "none";
        document.body.appendChild(link);
    }
    link.click();
    document.getElementById("loadfile").files.length = 0;
});
$('#header').on('click' , '#upload', function()
{
    $('#loadfile').click();
    $(this).css({"background-color":"grey"});
});
$('#header').on('click', '#load', function()
{
    if (tree.length > 1 || tree[0].statement != "")
    {
        alert("Please reload the page before loading a new file!");
        return;
    }
    var filename = document.getElementById("loadfile").files[0];
    var areader = new FileReader();
    areader.onload = function(fileload)
    {
        var filetext = fileload.target.result;
        loadtree = jQuery.parseJSON(filetext);
        createtree();
    };
    areader.readAsText(filename, "UTF-8");
});


/* Please for the sake of humanity and the programming gods and whatever floats
your damn boat, break this beast of a function into smaller functions and/or
make it more clean, because holy butterballs this thing is unreadable as is and
I'm super super sorry but I'm tired and finals are over and I don't wanna work
on this any more.  Feel free to send me an email (address is in the readme) if you
can't figure out what is going on.  The BASIC overview is that it checks if
each statement is correct (checkcorrectness) then it uses (uniquestatements) to find
the unique checks of a statement.  Then it tries to see how the statement was broken
down, by double not sign, and, or, conditional, and biconditional... with the functions
above.  Finally it checks if that symbol that was broken down is correct... and then it
checks for closes and opens.  Then it checks if the proof is complete.  Shit ton of
if then statements so just just break it down by those and then work from there.  You can
do it... I hope!

checkstate            - the statement being checked
checkid               - the id of the statement being checked (including the #)
checknum              - the number of checks
skip                  - if a statement is incorrect syntax, it is skipped completely
diffstates            - the uniquestatements
*/

$('#header').on('click','#gradework', function()
{
    //printtree();
    var checkstate;
    var checkid;
    var checknum;
    var skip = 0;
    $('#greenhouse').find('.node').each(function()
    {
        if ($(this).find('.statement').is(":visible"))
        {
            $(this).find('.aform').submit();
        }
    });
    for (var i = 0; i < tree.length; i++)
    {
        checkstate = removespace(tree[i].statement);
        checknum = tree[i].checks.length;
        checkid = '#' + tree[i].name;
        var iscorrect = checkcorrectness(tree[i].statement)
        if (iscorrect == false)
        {
            $('#greenhouse').find(checkid).css({"background-color":"blue"});
            skip = 1;
            continue;
        }
        for (var j = 0; j < tree[i].checks.length; j++)
        {
            var acheck = getanode(tree, tree[i].checks[j]);
            iscorrect = checkcorrectness(acheck.statement);
            if (iscorrect == false)
            {
                $('#greenhouse').find('#'+tree[i].checks[j]).css({"background-color":"blue"});
                skip = 1;
            }
        }
        if (skip == 1)
        {
            continue;
        }
        var symeval = "";
        if (checknum == 1)
        {
            var acheck = getanode(tree, tree[i].checks[0]);
            var acheckstate = removespace(acheck.statement);
            if ("¬¬"+acheckstate == checkstate || "¬¬("+acheckstate+")" == checkstate)
            {
                $('#greenhouse').find(checkid).css({"background-color":"rgb(0, 200, 0)"});
            }
            else
            {
                $('#greenhouse').find(checkid).css({"background-color":"red"});
            }
        }
        else if (checknum > 1)
        {
            var checksout = false;
            var diffstates = uniquestatements(tree[i].checks);
            if (checknum % 2 != 0)
            {
                $('#greenhouse').find(checkid).css({"background-color":"red"});
            }
            else if (diffstates.length == 2)
            {
                if (comparestatements(diffstates[0], diffstates[1], checkstate, "∧", false))
                {
                    checksout = checkfornobranch(tree[i].checks);
                    if (checksout == true)
                    {
                        checksout = checkbalance(tree[i].name, tree[i].checks);
                    }
                    symeval = "∧";
                }
                else if (comparestatements(diffstates[0], diffstates[1], checkstate, "∨", false))
                {
                    checksout = checkforbranch(tree[i].checks);
                    if (checksout == true)
                    {
                        checksout = checkbalance(tree[i].name, tree[i].checks);
                    }
                    symeval = "∨";
                }
                else if (comparestatementscond(diffstates[0], diffstates[1], checkstate, false))
                {
                    checksout = checkforbranch(tree[i].checks);
                    if (checksout == true)
                    {
                        checksout = checkbalance(tree[i].name, tree[i].checks);
                    }
                    symeval = "→";
                }
                else if(comparestatementscond(diffstates[0], diffstates[1], checkstate, true))
                {
                    checksout = checkfornobranch(tree[i].checks);
                    if (checksout == true)
                    {
                        checksout = checkbalance(tree[i].name, tree[i].checks);
                    }
                    symeval = "→";
                }
                else if (diffstates[0][0] == "¬" && diffstates[1][0] == "¬")
                {
                    diffstates[0] = diffstates[0].substr(1);
                    diffstates[1] = diffstates[1].substr(1);
                    if (comparestatements(diffstates[0], diffstates[1], checkstate, "∧", true))
                    {
                        checksout = checkforbranch(tree[i].checks);
                        if (checksout == true)
                        {
                            checksout = checkbalance(tree[i].name, tree[i].checks);
                        }
                        symeval = "∧";
                    }
                    else if (comparestatements(diffstates[0], diffstates[1], checkstate, "∨", true))
                    {
                        checksout = checkfornobranch(tree[i].checks);
                        if (checksout == true)
                        {
                            checksout = checkbalance(tree[i].name, tree[i].checks);
                        }
                        symeval = "∨";
                    }
                    else
                    {
                        $('#greenhouse').find(checkid).css({"background-color":"red"});
                    }
                }
                else
                {
                    $('#greenhouse').find(checkid).css({"background-color":"red"});
                }
            }
            else if (diffstates.length == 4)
            {
                var temp1 = "";
                var temp2 = "";
                for (var j = 0; j < diffstates.length; j++)
                {
                    var isdsingle = false;
                    if (diffstates[j].search("∧") != -1
                    || diffstates[j].search("∨") != -1
                    || diffstates[j].search("→") != -1
                    || diffstates[j].search("↔") != -1)
                    {
                        isdsingle = true;
                    }
                    for (var k = 0; k < diffstates.length; k++)
                    {
                        var isd2single = false;
                        if (diffstates[j].search("∧") != -1
                        || diffstates[j].search("∨") != -1
                        || diffstates[j].search("→") != -1
                        || diffstates[j].search("↔") != -1)
                        {
                            isd2single = true;
                        }
                        if ((diffstates[j] == "¬" + diffstates[k] && isd2single == false)
                            || diffstates[j] == "¬(" + diffstates[k] + ")")
                        {
                            if (temp1 == "")
                            {
                                temp1 = diffstates[k];
                            }
                            else if (temp1 != diffstates[k] && temp2 == "")
                            {
                                temp2 = diffstates[k];
                            }
                        }
                    }
                }
                if (temp1 == "" || temp2 == "")
                {
                    $('#greenhouse').find(checkid).css({"background-color":"red"});
                }
                else
                {
                    diffstates[0] = temp1;
                    diffstates[1] = temp2;
                    if(comparestatements(diffstates[0], diffstates[1], checkstate, "↔", false))
                    {
                        checksout = checkifonlyif(tree[i].checks, diffstates[0], diffstates[1], true);
                        if (checksout == true)
                        {
                            checksout = checkbalance(tree[i].name, tree[i].checks);
                        }
                        symeval = "↔";
                    }
                    else if (comparestatements(diffstates[0], diffstates[1], checkstate, "↔", true))
                    {
                        checksout = checkifonlyif(tree[i].checks, diffstates[0], diffstates[1], false);
                        if (checksout == true)
                        {
                            checksout = checkbalance(tree[i].name, tree[i].checks);
                        }
                        symeval = "↔";
                    }
                    else
                    {
                        $('#greenhouse').find(checkid).css({"background-color":"red"});
                    }
                }
            }
            else
            {
                $('#greenhouse').find(checkid).css({"background-color":"red"});
            }
            if (checksout == true)
            {
                checksout = nextsymtoeval(symeval, checkstate);
                if (checksout == true)
                {
                    $('#greenhouse').find(checkid).css({"background-color":"rgb(0, 200, 0)"});
                }
                else
                {
                    $('#greenhouse').find(checkid).css({"background-color":"red"});
                }
            }
            else
            {
                $('#greenhouse').find(checkid).css({"background-color":"red"});
            }
        }
        else
        {
            if (tree[i].closed == true)
            {
                checkclosed(checkid, checkstate);
            }
            else
            {
                $('#greenhouse').find(checkid).css({"background-color":"white"});
            }
        }
    }
    for (var i = 0; i < tree.length; i++)
    {
        checkstate = removespace(tree[i].statement);
        checkid = '#' + tree[i].name;
        if (tree[i].open == true)
        {
            checkopen(checkid, checkstate);
        }
    }
    var foundnonev = false;
    for (var i = 0; i < tree.length; i++)
    {
        checkstate = removespace(tree[i].statement);
        checknum = tree[i].checks.length;
        checkid = '#' + tree[i].name;
        var astate = tree[i].statement;
        if ($(checkid).css("background-color") != "rgb(0, 200, 0)")
        {
            if ($(checkid).css("background-color") == "rgb(255, 0, 0)"
                || $(checkid).css("background-color") == "rgb(0, 0, 255)")
            {
                foundnonev = true;
            }
            if ($(checkid).parent().find('.branchl').length == 0
            && $(checkid).parent().children('.node').last().attr('id') == $(checkid).attr('id'))
            {
                foundnonev = true;
            }
        }
        if (checktreestructure() == false)
        {
            foundnonev = true;
        }
    }
    if (foundnonev == false)
    {
        window.alert("Proof Is Complete!");
        $('#gradework').css({"background-color":"gold"});
    }
    else
    {
        $('#gradework').css({"background-color":"green"});
    }
});


$('#header').on('click','#notb',function()
{
    $('#greenhouse').find('.node').each(function()
    {
        if ($(this).find('.statement').is(":visible"))
        {
            var temp = $(this).find('.statement').val();
            var sym = $('#notb').text();
            temp = temp + sym;
            $(this).find('.statement').val(temp);
            $(this).find('.statement').focus();
        }
    });
});
$('#header').on('click','#andb',function()
{
    $('#greenhouse').find('.node').each(function()
    {
        if ($(this).find('.statement').is(":visible"))
        {
            var temp = $(this).find('.statement').val();
            var sym = $('#andb').text();
            temp = temp + sym;
            $(this).find('.statement').val(temp);
            $(this).find('.statement').focus();
        }
    });
});
$('#header').on('click','#orb',function()
{
    $('#greenhouse').find('.node').each(function()
    {
        if ($(this).find('.statement').is(":visible"))
        {
            var temp = $(this).find('.statement').val();
            var sym = $('#orb').text();
            temp = temp + sym;
            $(this).find('.statement').val(temp);
            $(this).find('.statement').focus();
        }
    });
});
$('#header').on('click','#ifthenb',function()
{
    $('#greenhouse').find('.node').each(function()
    {
        if ($(this).find('.statement').is(":visible"))
        {
            var temp = $(this).find('.statement').val();
            var sym = $('#ifthenb').text();
            temp = temp + sym;
            $(this).find('.statement').val(temp);
            $(this).find('.statement').focus();
        }
    });
});
$('#header').on('click','#ifonlyb',function()
{
    $('#greenhouse').find('.node').each(function()
    {
        if ($(this).find('.statement').is(":visible"))
        {
            var temp = $(this).find('.statement').val();
            var sym = $('#ifonlyb').text();
            temp = temp + sym;
            $(this).find('.statement').val(temp);
            $(this).find('.statement').focus();
        }
    });
});


$('#header').on('click','#forallb',function()
{
    $('#greenhouse').find('.node').each(function()
    {
        if ($(this).find('.statement').is(":visible"))
        {
            var temp = $(this).find('.statement').val();
            var sym = $('#forallb').text();
            temp = temp + sym;
            $(this).find('.statement').val(temp);
            $(this).find('.statement').focus();
        }
    });
});
$('#header').on('click','#existsb',function()
{
    $('#greenhouse').find('.node').each(function()
    {
        if ($(this).find('.statement').is(":visible"))
        {
            var temp = $(this).find('.statement').val();
            var sym = $('#existsb').text();
            temp = temp + sym;
            $(this).find('.statement').val(temp);
            $(this).find('.statement').focus();
        }
    });
});
$('#header').on('click','#editmode', function()
{
    if ($('#deletemode').css("background-color") != "rgb(255, 0, 0)")
    {
        $('#deletemode').click();
    }
    if ($(this).css("background-color") == "rgb(0, 0, 255)")
    {
        $('#greenhouse').children('.node').last().find('.addcheck').hide();
        $('#greenhouse').children('.node').last().find('.add').hide();
        $('#greenhouse').children('.node').last().find('.done').hide();
        $('#greenhouse').children('.node').last().find('.remove').hide();
        $('#greenhouse').children('.node').last().find('.single').show();
        $('#greenhouse').find('.branchl').each(function()
        {
            $(this).children('.node').last().find('.addcheck').hide();
            $(this).children('.node').last().find('.add').hide();
            $(this).children('.node').last().find('.remove').hide();
            $(this).children('.node').last().find('.done').hide();
            $(this).children('.node').last().find('.single').show();
        });
        $('#greenhouse').find('.branchr').each(function()
        {
            $(this).children('.node').last().find('.addcheck').hide();
            $(this).children('.node').last().find('.add').hide();
            $(this).children('.node').last().find('.remove').hide();
            $(this).children('.node').last().find('.done').hide();
            $(this).children('.node').last().find('.single').show();
        });
        $(this).css({"background-color":"silver"});
    }
    else
    {
        if ($('#greenhouse').find('.branchl').length > 0)
        {
            $('#greenhouse').children('.node').last().find('.addcheck').show();
            $('#greenhouse').children('.node').last().find('.single').hide();
            $('#greenhouse').find('.branchl').each(function()
            {
                if ($(this).find('.branchl').length > 0)
                {
                    $(this).children('.node').last().find('.addcheck').show();
                    $(this).children('.node').last().find('.single').hide();
                }
                else if ($(this).children('.node').last().find('.open').css("float") != "left"
                || $(this).children('.node').last().find('.close').css("float") != "left")
                {
                    $(this).children('.node').last().find('.single').hide();
                }
            });
            $('#greenhouse').find('.branchr').each(function()
            {
                if ($(this).find('.branchl').length > 0)
                {
                    $(this).children('.node').last().find('.addcheck').show();
                    $(this).children('.node').last().find('.single').hide();
                }
                else if ($(this).children('.node').last().find('.open').css("float") != "left"
                || $(this).children('.node').last().find('.close').css("float") != "left")
                {
                    $(this).children('.node').last().find('.single').hide();
                }
            });
        }
        else if ($('#greenhouse').children('.node').last().find('.open').css("float") != "left"
        || $(this).children('.node').last().find('.close').css("float") != "left")
        {
            $(this).children('.node').last().find('.single').hide();
        }
        $(this).css({"background-color":"blue"});
    }
});
$('#header').on('click','#deletemode', function()
{
    var allnodes = $('#greenhouse').find('.node');
    if ($('#editmode').css("background-color") != "rgb(0, 0, 255)")
    {
        $('#editmode').click();
    }
    if ($(this).css("background-color")!="rgb(255, 0, 0)")
    {
        allnodes.children('.nodebottom').children('.delete').hide();
        allnodes.children('.nodebottom').children('.addcheck').show();
        for (var i = 0; i < bottomnodes.length; i++)
        {
            if (typeof bottomnodes[i] != 'undefined')
            {
                bottomnodes[i].children('.nodebottom').children('.addcheck').hide();
                bottomnodes[i].children('.nodebottom').children('.single').show();
                bottomnodes[i].children('.nodebottom').children('.double').show();
                bottomnodes[i].children('.nodebottom').children('.open').show();
                bottomnodes[i].children('.nodebottom').children('.close').show();
                if (bottomnodes[i].find('.open').css("float") != "left")
                {
                    bottomnodes[i].children('.nodebottom').children('.single').hide();
                    bottomnodes[i].children('.nodebottom').children('.double').hide();
                    bottomnodes[i].children('.nodebottom').children('.close').hide();
                }
                if (bottomnodes[i].find('.close').css("float") != "left")
                {
                    bottomnodes[i].children('.nodebottom').children('.single').hide();
                    bottomnodes[i].children('.nodebottom').children('.double').hide();
                    bottomnodes[i].children('.nodebottom').children('.open').hide();
                }
            }
        }
        bottomnodes.length = 0;
        for (var i = 0; i < tree.length; i++)
        {
            var anid = '#' + tree[i].name;
            if ($('#greenhouse').find(anid).length == 0)
            {
                tree.splice(i,1);
                i--;
            }
        }
        $(this).css({"background-color":"red"});
        if (deletewarning == 0)
        {
            alert("After making major deletes, if the nodes are skewed please save the file and re-load it to a refreshed page.");
            deletewarning = 1;
        }
    }
    else
    {
        allnodes.each(function()
        {
            if ($(this).attr('id') != '0')
            {
                if ($(this).find('.open').is(':visible')
                || $(this).find('.close').is(':visible'))
                {
                    bottomnodes[bottomnodes.length] = $(this);
                }
                $(this).children('.nodebottom').children('.addcheck').hide();
                $(this).children('.nodebottom').children('.add').hide();
                $(this).children('.nodebottom').children('.done').hide();
                $(this).children('.nodebottom').children('.remove').hide();
                $(this).children('.nodebottom').children('.single').hide();
                $(this).children('.nodebottom').children('.double').hide();
                $(this).children('.nodebottom').children('.open').hide();
                $(this).children('.nodebottom').children('.close').hide();
                $(this).children('.nodebottom').children('.delete').show();
            }
            else
            {
                if ($(this).find('.open').is(':visible')
                || $(this).find('.close').is(':visible'))
                {
                    bottomnodes[bottomnodes.length] = $(this);
                }
                $(this).children('.nodebottom').children('.addcheck').hide();
                $(this).children('.nodebottom').children('.add').hide();
                $(this).children('.nodebottom').children('.done').hide();
                $(this).children('.nodebottom').children('.remove').hide();
                $(this).children('.nodebottom').children('.single').hide();
                $(this).children('.nodebottom').children('.double').hide();
                $(this).children('.nodebottom').children('.open').hide();
                $(this).children('.nodebottom').children('.close').hide();
                $(this).children('.nodebottom').children('.delete').hide();
            }
        });
        $(this).css({"background-color":"silver"});
    }
});
$('body').on('mouseover', '.checksalt', function()
{
    var checkstext = $(this).parent().children('.checks').text();
    var statementtext = $(this).parent().parent().find('.displaystate').text();
    statementhold = statementtext;
    $(this).parent().parent().find('.displaystate').text(checkstext);
    $(this).parent().parent().find('.clickhere').text(checkstext);
});
$('body').on('mouseout', '.checksalt', function()
{
    $(this).parent().parent().find('.displaystate').text(statementhold);
    $(this).parent().parent().find('.clickhere').text('Click Here');
});
$('body').on('click','.close', function()
{
    anode = getanode(tree,$(this).parent().parent().attr('id'));
    if (anode.closed == false)
    {
        $(this).parent().find('.single').hide();
        $(this).parent().find('.double').hide();
        $(this).parent().find('.open').hide();
        $(this).css({"background-color":"silver", "float":"none"});
        anode.closed = true;
    }
    else
    {
        $(this).parent().find('.single').show();
        $(this).parent().find('.double').show();
        $(this).parent().find('.open').show();
        $(this).css({"background-color":"rgb(153, 102, 51)", "float":"left"});
        anode.closed = false;
    }
});
$('body').on('click','.open', function()
{
    anode = getanode(tree,$(this).parent().parent().attr('id'));
    if (anode.open == false)
    {
        $(this).parent().find('.single').hide();
        $(this).parent().find('.double').hide();
        $(this).parent().find('.close').hide();
        $(this).css({"background-color":"silver","float":"right"});
        anode.open = true;
    }
    else
    {
        $(this).parent().find('.single').show();
        $(this).parent().find('.double').show();
        $(this).parent().find('.close').show();
        $(this).css({"background-color":"rgb(107, 71, 36)","float":"left"});
        anode.open = false;
    }
});
$('body').on('click','.delete', function()
{
    if ($(this).parent().parent().parent().children().first().next().next().attr('class') == "branchl"
    || $(this).parent().parent().parent().children().length == 2 && $(this).parent().parent().parent().attr('id') != "greenhouse")
    {
        var parentofdel = $(this).parent().parent().parent().parent();
        parentofdel.children('.branchl').remove();
        parentofdel.children('.branchr').remove();
        bottomnodes[bottomnodes.length] = parentofdel.find('.node').last();
    }
    else
    {
        var parentofdel = $(this).parent().parent().parent();
        if (parentofdel.find('.node').last().attr('id') == $(this).parent().parent().attr('id'))
        {
            $(this).parent().parent().remove();
            bottomnodes[bottomnodes.length] = parentofdel.find('.node').last();
        }
        else
        {
            $(this).parent().parent().remove();
        }
    }
    var nodesleft = $('#greenhouse').find('.node');
    nodesleft.each(function()
    {
        var currnode = getanode(tree,$(this).attr('id'));
        var newchecks = "Checks:";
        for (var i = 0; i < currnode.checks.length; i++)
        {
            currname = currnode.checks[i]
            if ($('#greenhouse').find('#'+currname+'').length == 0)
            {
                var test = currnode.checks.splice(i,1);
                i--;
            }
            else
            {
                newchecks = newchecks.concat(" ");
                newchecks = newchecks.concat(currnode.checks[i]);
            }
        }
        if (currnode.checks.length <= 4)
        {
            $(this).children('.nodetop').children('.nodetitle').children('.checks').show();
            $(this).children('.nodetop').children('.nodetitle').children('.checksalt').hide();
        }
        $(this).children('.nodetop').children('.nodetitle').children('.checks').text(newchecks);
    });

});
$('body').on('click','.addcheck',function()
{
    $(this).parent().children('.done').show();
    beingchecked = $(this).parent().parent();
    var allnodes = $('#greenhouse').find('.node');
    allnodes.children('.nodebottom').children('.addcheck').hide();
    allnodes.each(function()
    {
        if ($(this).children('.nodebottom').children('.open').is(":visible")
        || $(this).children('.nodebottom').children('.close').is(":visible"))
        {
            bottomnodes[bottomnodes.length] = $(this);
            $(this).children('.nodebottom').children('.single').hide();
            $(this).children('.nodebottom').children('.double').hide();
            $(this).children('.nodebottom').children('.open').hide();
            $(this).children('.nodebottom').children('.close').hide();
        }
    });
    allnodes = $(this).parent().parent().parent().find('.node');
    var sibabove = $(this).parent().parent().prevAll();
    allnodes.children('.nodebottom').children('.addcheck').hide();
    allnodes.children('.nodebottom').children('.delete').hide();
    allnodes.each(function()
    {
        if (!$(this).children('.nodebottom').children('.done').is(":visible"))
        {
            $(this).children('.nodebottom').children('.add').show();
        }
    });
    sibabove.children('.nodebottom').children('.addcheck').hide();
    sibabove.children('.nodebottom').children('.add').hide();
    for (var i = 0; i < tree.length; i++)
    {
        for (var j = 0; j < tree[i].checks.length; j++)
        {
            $('#'+tree[i].checks[j]).find('.add').hide();
            $('#'+tree[i].checks[j]).find('.addcheck').hide();
        }
    }
    var currnode = getanode(tree, beingchecked.attr('id'));
    for (var i = 0; i < currnode.checks.length; i++)
    {
        var matchingname = currnode.checks[i];
        var alreadychecked = $("#greenhouse").find('#'+matchingname);
        alreadychecked.children('.nodebottom').children('.add').hide();
        alreadychecked.children('.nodebottom').children('.remove').show();
    }
});
$('body').on('click','.add',function()
{
    var currnode = getanode(tree, beingchecked.attr('id'));
    currnode.checks[currnode.checks.length] = $(this).parent().parent().attr('id');
    var currchecks = beingchecked.children('.nodetop').children('.nodetitle').children('.checks').text();
    if (currnode.checks.length > 4)
    {
        beingchecked.children('.nodetop').children('.nodetitle').children('.checks').hide();
        beingchecked.children('.nodetop').children('.nodetitle').children('.checksalt').show();
    }
    currchecks = currchecks.concat(" ");
    var nodename = $(this).parent().parent().attr('id');
    currchecks = currchecks.concat(nodename);
    beingchecked.children('.nodetop').children('.nodetitle').children('.checks').text(currchecks);
    $(this).parent().children('.add').hide();
    $(this).parent().children('.remove').show();
});
$('body').on('click','.done',function()
{
    var allnodes = $('#greenhouse').find('.node');
    allnodes.children('.nodebottom').children('.addcheck').show();
    allnodes.children('.nodebottom').children('.add').hide();
    allnodes.children('.nodebottom').children('.remove').hide();
    allnodes.children('.nodebottom').children('.done').hide();
    for (var i = 0; i < bottomnodes.length; i++)
    {
        bottomnodes[i].children('.nodebottom').children('.addcheck').hide();
        bottomnodes[i].children('.nodebottom').children('.single').show();
        bottomnodes[i].children('.nodebottom').children('.double').show();
        bottomnodes[i].children('.nodebottom').children('.open').show();
        bottomnodes[i].children('.nodebottom').children('.close').show();
        if (bottomnodes[i].find('.open').css("float") != "left")
        {
            bottomnodes[i].children('.nodebottom').children('.single').hide();
            bottomnodes[i].children('.nodebottom').children('.double').hide();
            bottomnodes[i].children('.nodebottom').children('.close').hide();
        }
        if (bottomnodes[i].find('.close').css("float") != "left")
        {
            bottomnodes[i].children('.nodebottom').children('.single').hide();
            bottomnodes[i].children('.nodebottom').children('.double').hide();
            bottomnodes[i].children('.nodebottom').children('.open').hide();
        }
    }
    bottomnodes.length = 0;
});
$('body').on('click','.remove',function()
{
    var newchecks = "Checks:";
    var currnode = getanode(tree, beingchecked.attr('id'));
    for (var i = 0; i < currnode.checks.length; i++)
    {
        if ($(this).parent().parent().attr('id') == currnode.checks[i])
        {
            var test = currnode.checks.splice(i,1);
            i--;
        }
        else
        {
            newchecks = newchecks.concat(" ");
            newchecks = newchecks.concat(currnode.checks[i]);
        }
    }
    if (currnode.checks.length <= 4)
    {
        beingchecked.children('.nodetop').children('.nodetitle').children('.checks').show();
        beingchecked.children('.nodetop').children('.nodetitle').children('.checksalt').hide();
    }
    $(this).parent().children('.remove').hide();
    $(this).parent().children('.add').show();
    beingchecked.children('.nodetop').children('.nodetitle').children('.checks').text(newchecks);
});
$('body').on('click', '.clickhere', function()
{
    $('#greenhouse').find('.node').each(function()
    {
        if ($(this).find('.statement').is(":visible"))
        {
            $(this).find('.aform').submit();
        }
    });
    $(this).next().show();
    $(this).next().children('.statement').val("");
    $(this).next().children('.statement').focus();
    $(this).hide();
});
$('body').on('click', '.displaystate', function()
{
    $('#greenhouse').find('.node').each(function()
    {
        if ($(this).find('.statement').is(":visible"))
        {
            $(this).find('.aform').submit();
        }
    });
    $(this).prev().show();
    var temp = $(this).text();
    $(this).prev().children('.statement').val(temp);
    $(this).prev().children('.statement').focus();
    $(this).prev().prev().hide();
    $(this).hide();
});
$('body').on('submit', '.aform', function(event)
{
    event.preventDefault();
    $(this).hide();
    var origstate = $(this).children('.statement').val();
    var nodename = $(this).parent().parent().attr('id');
    var finalstate = origstate.split("&").join("∧").split("|").join("∨").split("~").join("¬").split("<>").join("↔").split("->").join("→");
    editnodestate(nodename, finalstate);
    if (finalstate == "")
    {
        $(this).next().text("NULL")
        $(this).next().show();
    }
    else
    {
        $(this).next().text(finalstate);
        $(this).next().show();
    }
});
$('#header').on('submit', '#saveform', function(event)
{
    event.preventDefault();
    $('#save').click();
});
$('body').on('click', '.single', function()
{
    var newheight = $('#greenhouse').height() + $(this).parent().parent().css('height')+14;
    $('#greenhouse').css({"height":newheight});
    if ($(this).parent().parent().find('.statement').is(":visible"))
    {
        $(this).parent().parent().find('.aform').submit();
    }
    naming = naming + 1;
    var newnode = {name:naming.toString(), statement:"", open:false, closed:false, checks:[], kids:[]};
    tree.push(newnode);
    var container = $(this).parent().parent().parent();
    var nodetoclone = $(this).parent().parent();
    if (container.children(".branchl").size() > 0)
    {
        $(nodetoclone).clone().attr('id', naming.toString()).insertBefore(container.children(".branchl"));
    }
    else
    {
        $(nodetoclone).clone().attr('id', naming.toString()).appendTo(container);
    }
    container.children(".node").last().children(".nodetop").children(".displaystate").hide();
    container.children(".node").last().children(".nodetop").children(".clickhere").show();
    container.children(".node").last().css({"background-color":"white"});
    var nodename = "#";
    nodename = nodename.concat(naming.toString());
    container.children(".node").last().children(".nodetop").children(".nodetitle").children(".name").text(nodename);
    container.children(".node").last().children(".nodetop").children(".nodetitle").children(".checks").text("Checks:");
    nodetoclone.children('.nodebottom').children('.single').hide();
    nodetoclone.children('.nodebottom').children('.double').hide();
    nodetoclone.children('.nodebottom').children('.open').hide();
    nodetoclone.children('.nodebottom').children('.close').hide();
    nodetoclone.children('.nodebottom').children('.delete').hide();
    nodetoclone.children('.nodebottom').children('.addcheck').show();
});
$('body').on('click', '.double', function()
{
    var newheight = $('#greenhouse').height() + $(this).parent().parent().css('height')+14;
    $('#greenhouse').css({"height":newheight});
    if ($(this).parent().parent().find('.statement').is(":visible"))
    {
        $(this).parent().parent().find('.aform').submit();
    }
    var container = $(this).parent().parent().parent();
    var newbranch = $('<div><div/>');
    newbranch.attr("class","branchl");
    var newwidth = ((container.width() / 2)-4);
    newbranch.css({"width":newwidth, "float":"left", "border-radius":"10px", "border-color":"silver", "border-width":"2px", "border-style":"solid", "position":"absolute"});
    var newbranch2 = $('<div><div/>');
    var branch2margin = newwidth + 4;
    newbranch2.attr("class","branchr");
    newbranch2.css({"width":newwidth, "float":"left", "border-radius":"10px", "border-color":"silver", "border-width":"2px", "border-style":"solid", "position":"absolute", "margin-left":branch2margin});
    container.append(newbranch);
    container.append(newbranch2);
    var branchl = container.children('.branchl');
    var branchr = container.children('.branchr');
    naming = naming + 1;
    var newnode = {name:naming.toString(), statement:"", open:false, closed:false, checks:[], kids:[]};
    tree.push(newnode);
    var nodetoclone = $(this).parent().parent();
    $(nodetoclone).clone().attr('id', naming.toString()).appendTo(branchl);
    branchl.children(".node").first().children(".nodetop").children(".displaystate").hide();
    branchl.children(".node").first().children(".nodetop").children(".clickhere").show();
    branchl.children(".node").first().css({"background-color":"white"});
    var nodename = "#".concat(naming.toString());
    branchl.children(".node").first().children(".nodetop").children(".nodetitle").children(".name").text(nodename);
    container.children(".node").last().children(".nodetop").children(".nodetitle").children(".checks").text("Checks:");
    naming = naming + 1;
    newnode = {name:naming.toString(), statement:"", open:false, closed:false, checks:[], kids:[]};
    tree.push(newnode);
    $(nodetoclone).clone().attr('id', naming.toString()).appendTo(branchr);
    branchr.children(".node").first().children(".nodetop").children(".displaystate").hide();
    branchr.children(".node").first().children(".nodetop").children(".clickhere").show();
    branchr.children(".node").first().css({"background-color":"white"});
    var nodename = "#".concat(naming.toString());
    branchr.children(".node").first().children(".nodetop").children(".nodetitle").children(".name").text(nodename);
    container.children(".node").last().children(".nodetop").children(".nodetitle").children(".checks").text("Checks:");
    nodetoclone.children('.nodebottom').children('.single').hide();
    nodetoclone.children('.nodebottom').children('.double').hide();
    nodetoclone.children('.nodebottom').children('.open').hide();
    nodetoclone.children('.nodebottom').children('.close').hide();
    nodetoclone.children('.nodebottom').children('.delete').hide();
    nodetoclone.children('.nodebottom').children('.addcheck').show();
    if (branchl.width() <= 208)
    {
        var temp = $('html').width() + (420 - container.width());
        $('html').css({"width":temp});
        $('body').css({"width":temp});
        branchr.css({"width":208, "position":"absolute", "margin-left":212});
        branchl.css({"width":208, "position":"absolute"});
        temp = 420 - container.width();
        widen(container,temp);
    }
});

-->
