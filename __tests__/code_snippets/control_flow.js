/* eslint-disable */

// input: if else statement
if (a) {
    b;
}

if (a) b = c;

if (a) {
    return 5;
} else if (5) {
    return 8;
} else {
    1;
}
// output:
if (a) {
    b;
}

if (a) {
    b = c;
}

if (a) {
    return 5;
} else if (5) {
    return 8;
} else {
    1;
}

// input: try catch statement
try {
    c;
} catch (error) {
    throw error;
}

try {

} finally {
    b;
}

// output:
try {
    c;
} catch (error) {
    throw error;
}
try {} finally {
    b;
}

// input: switch
switch (a) {
case 2:
case 1:
    b = c;
    break;
case 3:
    c = b;
    break;
default:
    return 5;
}
// output:
switch (a) {
case 2:
case 1:
    b = c;
    break;
case 3:
    c = b;
    break;
default:
    return 5;
}
