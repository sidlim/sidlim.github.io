// Vector Sums, with arrays.
function vsum() {
    // Simple 2 argument case, just add the components. The components may be other vectors themselves, so I've done some recursion.
    if (arguments.length == 2) {
        var v1 = arguments[0];
        var v2 = arguments[1];
        if (typeof v1 == typeof v2) {
            switch(typeof v1) {
                case 'object':
                    if (Object.keys(v1).length == Object.keys(v2).length){
                        var resultant = [];
                        for (var i=0;i<Object.keys(v1).length;i++) {
                            resultant[i]=vsum(v1[i],v2[i]);
                        }
                        return(resultant);
                    }
                    else {
                        throw('Error: Cannot add vectors of different dimension');
                    }
                    break;
                case 'number':
                    return(v1+v2);
                case 'string':
                    throw('Error: Cannot add strings');
                case 'boolean':
                    throw('Error: Cannot add booleans');
            }
        }
        else{
            throw('Error: Cannot add two differing variable types');
        }
    }
    // Simple 1 argument case: Additive Identity is the 0 vector, so just return the same argument.
    else if (arguments.length == 1){
        return(arguments[0]);
    }
    // More than 2 arguments: Use a for loop to iterate through, taking two vectors at a time, vsumming them, and then using that resultant as the next's first vector.
    else if (arguments.length > 2) {
        var resultant = vsum(arguments[0],arguments[1]);
        for (var i=0;i<(arguments.length-2);i++) {
            resultant = vsum(resultant,arguments[i+2]);
        }
        return(resultant);
    }
}

// Scalar Multiplication, with arrays. t is a scalar, v is a vector. Works with matrices too.
function vscale(t,v) {
    switch(typeof v) {
        case 'object':
            var product = [];
            for (var i = 0; i<Object.keys(v).length; i++) {
                product[i] = vscale(t,v[i]);
            }
            return(product);
        case 'number':
            return(v*t);
        case 'string':
            throw('Error: Cannot scale strings');
        case 'boolean':
            throw('Error: Cannot scale booleans');
    }
}

// Matrix Transpose:
function transpose(m) {
    switch(typeof m) {
        case 'object':
            var Tmatrix = m[0].map(function(col, i) {
                return(m.map(function(row) {
                    return(row[i]);
                }));
            });
            return(Tmatrix);
        case 'number':
            throw('Error: Cannot transpose numbers');
        case 'string':
            throw('Error: Cannot transpose strings');
        case 'boolean':
            throw('Error: Cannot transpose booleans');
    }
}

// Vector Dot Product
function dotprod(v1,v2) {
    if ((typeof(v1) == typeof(v2)) && (v1.length == v2.length)) {
        switch(typeof(v1)) {
            case 'object':
                var sum = 0;
                for (var i = 0; i < v1.length; i++) {
                    sum += dotprod(v1[i],v2[i]);
                }
                return(sum);
            case 'number':
                return(v1*v2);
            case 'string':
                throw('Error: Cannot multiply strings');
            case 'boolean':
                throw('Error: Cannot multiply booleans');
        }
    }
    else {
        throw('Error: Both arguments must be of the same dimension and type in order to multiply');
    }
}

// Matrix Multiplication
function mmult(mL,mR) {
    var m1 = mL;
    if ((typeof(mL) == typeof(mR)) && (typeof(mL) == 'object')) {
        var m2 = transpose(mR);
        if ((m1[0][0] || m2[0][0]) == 'undefined') {throw('Error: mmult can only multiply matrices, not vectors');}
        var prod = [];
        for (var i = 0; i < m1.length; i++) {
            var row_i = [];
            for (var j = 0; j < m2.length; j++) {
                row_i.push(dotprod(m1[i],m2[j]));
            }
            prod.push(row_i);
        }
        return(prod);
    }
    else if ((typeof(mL) == typeof(mR)) && (typeof(mL) == 'number')) {
        return(mL*mR);
    }
    else {
        throw('Error: mmult can only multiply two matrices');
    }
}

function vmag(v) {
    switch (typeof(v)) {
        case 'object':
            if (v[0][0] !== undefined) {throw('Please input a vector or a scalar, not a matrix')}
            return(Math.sqrt(dotprod(v,v)));
        case 'number':
            return(Math.abs(v));
        default:
            throw('Error: Please input a vector or a scalar.');
    }
}

// Create a unit vector in the direction of v.
function norm(v) {
    return(vscale((1/(vmag(v))),v));
}

// Find the angle, in radians, between two different vectors.
function vangle(v1,v2) {
    return(Math.acos(dotprod(norm(v1),norm(v2))));
}

// Raising matrices to powers. Just repeated multiplication, and there *are* better algorithms for this, but I really don't think writing them is worth my time.
// Also incomplete, as I still need to put in support for roots (fractional powers) and the identity (0).
function mpow(m,pow) {
    var partprod = m;
    for (var p = 1; p < pow; p++) {
        partprod = mmult(m,partprod);
    }
    return(partprod);
}

// Evaluate determinants via minors:
function det(m) {
    if ((m.length == m[0].length) && (m[0][0][0] === undefined)) {
        if (m.length == 1) {
            return(m[0]);
        }
        if (m.length == 2) {
            return(m[0][0]*m[1][1]-m[1][0]*m[0][1]);
        }
        if (m.length > 2) {
            var pdet = 0;
            for (var i = 0; i < m.length; i++) {
                pdet += Math.pow((-1),(i)) * m[0][i] * det(subMatrix(m,0,i)); // Where p is the minor of m at (i,j);
            }
            return(pdet);
        }
    }
    else {
        throw('Error: Please input a square, 2-D matrix');
    }
}

// Get a minor of M at (r,c)
function subMatrix(A, row, column){
    var subMatrix = [];
    for(var i = 0; i<A.length-1; i++){
        subMatrix[i]=[];
        for(var j = 0; j<A[0].length-1; j++){
            subMatrix[i][j]=A[i+((i<row)?0:1)][j+((j<column)?0:1)];
        }
    }
    return(subMatrix);
}

function minverse(m) {
    var D = det(m)
    if (D == 0) {throw('Error: Input matrix is not invertible')}
    else if ((m[1][0] || m[0][1]) === undefined) {return(m[0][0])}
    else {
        var CoFMatrix = [];
        for (var i = 0; i < m.length; i++) {
            var row_i = [];
            for (var j = 0; j < m.length; j++) {
                row_i.push(Math.pow((-1),(i+j)) * det(subMatrix(m,i,j)));
            }
            CoFMatrix.push(row_i);
        }
        return(vscale((1/D),transpose(CoFMatrix)));
    }
}
