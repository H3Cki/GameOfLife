var cells = {};
var drawing = false;
var WIDTH, HEIGHT;
var GRIDW, GRIDH;
var framerate = 16;
var ready = false
var wasPressed = false
var resolutionValue, brushSizeValue, brushSizeXValue, brushSizeYValue
var framerateValue
var readyBtn
var OPTS = {
    framerate : 15,
    drawingFramerate : 999,
    resolution : 5,
    stroke : false,
    strokeWeight : 0,
    cellProb: 0.1,
    brushSizeX: 0,
    brushSizeY: 0,
}

function getBrushSize(){
    if (OPTS.brushSizeX == OPTS.brushSizeY) return OPTS.brushSizeX
    else return '?'
}

window.onload = function(){
 


    WIDTH = Math.floor( window.innerWidth * 0.8 )
    HEIGHT = Math.floor( window.innerHeight * 0.8 )

    

    $(function() { 

        resolutionValue = $('#resolution-value')
        framerateValue = $('#framerate-value')
        brushSizeValue = $('#brush-value')
        brushSizeXValue = $('#brushx-value')
        brushSizeYValue = $('#brushy-value')
        let resolutionInput = $('input[id="resolution"]')
        let framerateInput = $('input[id="framerate"]')
        let brushSizeInput = $('input[id="brush"]')
        let brushSizeXInput = $('input[id="brushx"]')
        let brushSizeYInput = $('input[id="brushy"]')
        let strokeInput = $('input[id="stroke"]')
        
        readyBtn = $('#ready')

        framerateValue.text(zeroPad(OPTS.framerate))
        resolutionValue.text(zeroPad(OPTS.resolution))
        brushSizeValue.text(zeroPad(getBrushSize(),3))
        brushSizeXValue.text(zeroPad(OPTS.brushSizeX,3))
        brushSizeYValue.text(zeroPad(OPTS.brushSizeY,3))


        brushSizeInput.attr('max', WIDTH > HEIGHT ? WIDTH / 4 / OPTS.resolution : HEIGHT / 4/ OPTS.resolution)
        brushSizeXInput.attr('max', WIDTH / 4 / OPTS.resolution)
        brushSizeYInput.attr('max', HEIGHT / 4 /OPTS.resolution)
        framerateInput.val(OPTS.framerate)
        resolutionInput.val(OPTS.resolution)
        brushSizeInput.val(getBrushSize())
        
        brushSizeXInput.val(OPTS.brushSizeX)
        brushSizeYInput.val(OPTS.brushSizeY)

        framerateInput.on('input change', (event) => {
            let v = parseInt(event.target.value)
            
            if (v == 0) {
                unReady()
                OPTS.framerate = 1
            }
            else {
                OPTS.framerate = v
            }
            framerateValue.text(zeroPad(v))
        })
    
        brushSizeInput.on('input change', (event) => {
            let v = event.target.value
            OPTS.brushSizeX = parseInt(v)
            OPTS.brushSizeY = parseInt(v)
            brushSizeXInput.val(parseInt(v))
            brushSizeYInput.val(parseInt(v))
            brushSizeValue.text(zeroPad(v))
            brushSizeXValue.text(zeroPad(v))
            brushSizeYValue.text(zeroPad(v))
        })

        brushSizeXInput.on('input change', (event) => {
            let v = event.target.value
            OPTS.brushSizeX = parseInt(v)
            brushSizeXInput.val(parseInt(v))
            brushSizeXValue.text(zeroPad(v))
            //brushSizeValue.text(getBrushSize())
        })


        brushSizeYInput.on('input change', (event) => {
            let v = event.target.value
            OPTS.brushSizeY = parseInt(v)
            brushSizeYInput.val(parseInt(v))
            brushSizeYValue.text(zeroPad(v))
            //brushSizeValue.text(getBrushSize())
        })

        resolutionInput.on('input change', (event) => {
            let v = parseInt(event.target.value)
            if (v == 1 && OPTS.stroke == true) {
                OPTS.stroke = false
                OPTS.strokeWeight = 0
                strokeInput[0].checked = false
            }
            OPTS.resolution = v
            resolutionValue.text(zeroPad(v))
        })

        strokeInput.on('change', (event) => {
            OPTS.stroke = event.target.checked
            OPTS.strokeWeight = event.target.checked ? 1 : 0
        })

        readyBtn.on('click', (event) => {
            if(!ready) {
                goReady()
            } else {
                unReady()
            }
        })

        $('#reset').on('click', (event) => {
            goReset()
        })

    });

    canvasSetup()
}

function unReady() {
    readyBtn.removeClass('running')
    readyBtn.text('Ready')
    ready = false
}

function zeroPad(value,len=2){
    while ((''+value).length < 2) value = '0' + value
    return value
}

function canvasSetup() {
    canvas = createCanvas(WIDTH, HEIGHT)
    canvas.addClass('map')
    background(0)
    noStroke()
    fill(255)
}   

function convertResolution(newResolution){
    for (let [key,cell] of Object.entries(cells)) {
        let x = Math.floor(cell.x * (newResolution / OPTS.resolution));
        let y = Math.floor(cell.y * (newResolution / OPTS.resolution));
        cell.x = x;
        cell.y = y;
        cell.updateHash()
        delete cells[key]
        cells[cell.hash] = cell
    }
    for (let [key,cell] of Object.entries(Cell.birthBuffer)) {
        let x = Math.floor(cell.x * (newResolution / OPTS.resolution));
        let y = Math.floor(cell.y * (newResolution / OPTS.resolution));
        cell.x = x;
        cell.y = y;
        cell.updateHash()
        delete cells[key]
        cells[cell.hash] = cell
    }
    
}

function goReset() {
    unReady()
    Cell.birthBuffer = {}
    cells = {}
    Cell.deathBuffer = {}
    background(0)
}

function goGenerate() {
    let c = 0
    let max = ( WIDTH*HEIGHT / OPTS.resolution ) * 0.1
    while (c < max) {
        let x = Math.floor((Math.random()*WIDTH/OPTS.resolution))
        let y = Math.floor((Math.random()*HEIGHT/OPTS.resolution))
        if(!Cell.birthBuffer[Cell.hash(x,y)]){
            let cell = new Cell(x,y)
            Cell.birthBuffer[cell.hash] = cell
            c += 1
        }   
        
    }
}

function goReady(){
    Cell.runBuffers()
    readyBtn.addClass('running')
    readyBtn.text('Running')
    ready = true

}

// function interpolatePoints(startx,starty,endx,endy) {
//     let points = []
//     let _sx = startx
//     let _sy = starty
//     let _tx = Math.abs(endx - startx)
//     let _ty = Math.abs(endy - starty) 
//     let max = _tx > _ty ? _tx : _ty
//     while(_sx != endx && _sy != endy) {
//         if(_tx) _tx -= OPTS.resolution
            
//         }
//         _sx += _stepx 
//         _sy += _stepy
//         points.push([Math.round(_sx),Math.round(_sy)])
//     }
//     return points
// }

var path = []
var drawPath = []
function draw(){
    stroke(0)
    strokeWeight(OPTS.strokeWeight)
    
    
    if (mouseIsPressed && mouseX >= 0 && mouseX <= WIDTH && mouseY >= 0 && mouseY <= HEIGHT) {

        frameRate(OPTS.drawingFramerate)
        let _gridX = Math.floor(mouseX / OPTS.resolution) * OPTS.resolution
        let _gridY = Math.floor(mouseY / OPTS.resolution) * OPTS.resolution

        let newCell = new Cell(_gridX, _gridY)
        Cell.birthBuffer[newCell.hash] = newCell
        path.push([_gridX,_gridY])
        newCell.draw()

        for (let i = -1 * OPTS.brushSizeX*OPTS.resolution; i <= OPTS.brushSizeX*OPTS.resolution; i += OPTS.resolution) {

            for (let j = -1 * OPTS.brushSizeY*OPTS.resolution; j <= OPTS.brushSizeY*OPTS.resolution; j += OPTS.resolution) {
                let gridX = _gridX + i
                let gridY = _gridY + j
                if (!Cell.birthBuffer[Cell.hash(gridX,gridY)]){
                    let newCell = new Cell(gridX, gridY)
                    Cell.birthBuffer[newCell.hash] = newCell
                    path.push([gridX,gridY])
                    newCell.draw()
                }
            }
            
        }
            

    } //else if (mouseX >= 0 && mouseX <= WIDTH && mouseY >= 0 && mouseY <= HEIGHT) {
    //     fill(0)
    //     for(let cord of drawPath){
    //         rect(cord[0],cord[1],OPTS.resolution,OPTS.resolution)
    //     }
    //     fill(255)
    //     let _gridX = Math.floor(mouseX / OPTS.resolution) * OPTS.resolution
    //     let _gridY = Math.floor(mouseY / OPTS.resolution) * OPTS.resolution

    //     rect(_gridX, _gridY,OPTS.resolution,OPTS.resolution)
    //     drawPath.push([_gridX,_gridY])

    //     for (let i = -1 * OPTS.brushSizeX*OPTS.resolution; i <= OPTS.brushSizeX*OPTS.resolution; i += OPTS.resolution) {
    //         for (let j = -1 * OPTS.brushSizeY*OPTS.resolution; j <= OPTS.brushSizeY*OPTS.resolution; j += OPTS.resolution) {
    //             let gridX = _gridX + i
    //             let gridY = _gridY + j
    //             rect(gridX, gridY,OPTS.resolution,OPTS.resolution)
    //             drawPath.push([gridX,gridY])
    //         }
            
    //     }
        
    // }
    
    else if (ready) {
        
        frameRate(OPTS.framerate)
        for(let cell of Object.values(cells)) {
            cell.update()
        }

        
    }
    Cell.runBuffers()

}


class Cell {

    static deathBuffer = {}
    static birthBuffer = {}

    static runBuffers(){
        
        Object.values(Cell.birthBuffer).map(cell => cell.live())
        Object.values(Cell.deathBuffer).map(cell => cell.die())
        Cell.deathBuffer = {}
        Cell.birthBuffer = {}
    }

    static hash(x,y){
        return x + "." + y
    }

    static cellAtCoords(x,y){
        return cells[Cell.hash(x,y)]
    }

    static checkNeighboursAt(_x,_y) {
        let n = 0
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i == 0 && j == 0) continue
                let x = _x + (i*OPTS.resolution);
                let y = _y + (j*OPTS.resolution);
                let cell = Cell.cellAtCoords(x,y)
                if (cell) n += 1
            }
        }
        return n
    }

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.updateHash()
    }
    
    updateHash(){
        this.hash = Cell.hash(this.x,this.y)
    }

    getNeighbours(checkPotential=true,parent=null){
        let n = 0
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i == 0 && j == 0) continue
                let x = this.x + (i*OPTS.resolution);
                let y = this.y + (j*OPTS.resolution);
                let cell = Cell.cellAtCoords(x,y)
                if (cell) n += 1
                else if(checkPotential && !Cell.birthBuffer[Cell.hash(x,y)] && Cell.checkNeighboursAt(x,y) == 3 && x >= 0 && y >= 0 && x+OPTS.resolution <= WIDTH &&  y+OPTS.resolution <= HEIGHT ) {
                    let c = new Cell(x,y)
                    Cell.birthBuffer[c.hash] = c
                }//
            }
        }
        return n
    }

    draw() {
        fill(255)
        rect(this.x,this.y,OPTS.resolution,OPTS.resolution)
    }


    update(){ 
        let n = this.getNeighbours(true)
        if (n < 2 || n > 3) Cell.deathBuffer[this.hash] = this
        else this.draw()
    }

    live(){
        cells[this.hash] = this
        this.draw()
    }

    die(){
        delete cells[this.hash]
        fill(80)
        rect(this.x,this.y,OPTS.resolution,OPTS.resolution)
    }


}


