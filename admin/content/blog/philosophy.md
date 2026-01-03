# Philosophy
:::meta
Node: J-TERM-01
Date: 2025-11-21
:::
We believe in raw data. We believe in the command line. We believe in green text on black backgrounds.

The medium is the message.
In this blog, we will be starting from absolutely nothing, and end up writing the base code of some of the most notorious malware of the 90s. We will first learn about how your programs actually exist in memory, how they run, learn about assembly, and finally come to the topic of the blog, Polymorphic Engines. 

When talking about a **program**, we must be precise about what we mean by it. A program, in formal terms is a set of machine instructions, stored in a file format such as ELF in linux (Executable and Linkable Format) or PE in windows, that exists on the _disk_. The instructions present in such files are not C/C++ or Python code, rather, they are present as machine code. To convert your instructions in C/C++ to machine code, you must _compile_ your code into a program. In particular, the `gcc` or any compiler for that matter, will output a ELF/PE file. 

Let us have a quick look at the anatomy of a program. It typically contains the following sections:
1. Header: Metadata to instruct the OS (more precisely, the kernel) how to read the file.
2. `.text`: The actual machine instructions.
3. `.data`: Hard-coded global variables. 
4. Symbol Table: Connects _names_ (of functions) to machine addresses.

> For interpreted languages such as Python or JavaScript, the program is the interpreter itself. For the interpreter, the code is just input. All the components we talk about here will exist for the interpreter, and NOT for the code you write _for_ the interpreter. 

The program only comes into action when we _load it_ into the CPU. The process of loading itself is fairly involved, and for now, irrelevant so we'll skip it. When this happens, a **process** is said to have been initiated. A process is distinct from a program, since by definition it is a _running program_. A process can be completely defined by it's **machine state**, which comprises the address space, registers such as program counter (PC) which instruct the process on which instruction to run next, the stack and frame pointers. For the time being, let us focus on the **address space**. The address space represents all the memory of the program, and is visualised in the following diagram.

![image](https://hackmd.io/_uploads/HkzbrPTM-g.png)


Although this diagram does a decent job of outlining the various parts of the address space, it's still not complete. Note that it starts from $0$KB (let's call it _low_) and ends at $16$KB (let's call it high). The program code starts at _low_, and is usually a *Read-only and Execute* (this will be important to us). After it comes the `.data` segment with the global variables with values, and `.bss` which has global variables without values. After it, the format is as given in the image, except for the kernel space (high memory) which is irrelevant to us as of now, and also mostly irrelevant on $64$-bit systems. Don't worry about `0x0000` to `0x0FFF` for now.

> There's a layer of abstraction we've completely skipped here. The address space we are looking at here is the virtual memory, _not_ the physical memory. Every program running on your system is made to believe that it has access to this entire huge block of memory, whereas that's not the case. The CPU's Memory Management Unit (MMU) maps these virtual addresses to fragments of the actual RAM.

The following section is not necessary to follow the article and can be skipped: 

In the entire section, I have been a little bit handwavy about the registers. It is intended, since the actual registers used for floating point data etc are different, and in each case many different registers can be used. I have chosen to abstract away the non-sense for it to make sense, so if you Google things, and find things to be convoluted, _do. not. worry._

While we are at it, we might enquire about what distinctions exist between the kind of data stored on the stack, as compared to the data on the heap. What the diagram mentions is _almost_ true. Let us separately discuss the heap and the stack. We'll draw the distinction using what _doesn't_ exist on the stack. However before we do that, we should note, _anything_ can be allocated on the heap, and _anything_ with a fixed size (known at compile time) can be allocated on the stack, what we're discussing here is typically how it's handled, without explicit declarations.

> C99 allows Variable Length Arrays (VLAs) `int arr[n]` where $n$ is determined at runtime, these VLAs exist on the stack. However, C11 made VLAs an optional feature due to their stackoverflow risks.

**Heap**: C only uses heap when explicitly told to. Otherwise it relies on stack/registers. All dynamically allocated data, i.e. `malloc`'d data, exists on the heap. Another way to say it would be, _except_ for global variables (whether initialized or uninitialized) every other data that doesn't exist on the stack, exists on the heap. 

**Stack**: Local variables (primitives, local arrays and structs, pointers), return addresses, saved frame pointer, function arguments (that do not fit into the registers), spilled registers and ofcourse `alloca` memory. To us, the saved frame pointer and function arguments can prove to be useful.

> Interestingly, most architectures allocate 4-8 registers for function arguments, the rest of the arguments go to the stack. The registers themselves are typically 64bit (on x64), and thus arguments which can't fit on registers also exist on the stack. `structs` have to be copied, but static arrays need not be! There's a lot to cover, I will probably end up  covering the entire length of the article in _side-notes_!

A **stack frame** put simply is a block of memory on the _call stack_ or in context of single-threaded programs, just the _stack_, that contains local data and execution context for a single function call. The following diagram shows how the call stack actually looks like, and highlights the difference between individual frames. Let us try to understand this diagram carefully.
![image](https://hackmd.io/_uploads/SJreeHhG-g.png)

First, note that the call stack is _not_ the stack of instructions of a function. It is simply a block of memory which contains the context for evaluation of a function call. Let us explain the rest through the lifecycle. When the stack is initialized for a process, it is initially empty. The stack only starts filling up as function calls occur. There's always a main function which calls the other functions. The stack frames of functions are stacked on top of each other on the basis of _order of execution_. It's a chronological order which defines the stacking. The stack grows downwards, starting from higher memory addresses to lower memory addresses. 

When a function starts, it sets up its own frame, without destroying the caller's frame. Thus, the saved RBP is the RBP (or the _frame base_) of the caller's frame. Thus, the RBP is simply a register which holds the _base_ at which the frame of a function starts. Next, the other stuff about the local variables is just the context, as mentioned multiple times before. Since the stack grows top down, $\text{RBP} + 8$ ($8$ being the number of bytes) holds the return address to the caller, $\text{RBP} - 8$ holds the first local variable of callee. Ofcourse, after the function call is finished, the stack frame is popped off of the stack. 

> Although the diagram _says_ Argument 1 and Argument 2, there's a very high chance that the these _aren't_ the first and second arguments. As mentioned earlier, arguments are only pushed to the stack if they can't fit on the 4-8 registers.

The RSP register is the most crucial one for modern architectures, since RBP isn't even used as a frame pointer! The RSP register holds the memory address of the _current_ top of the stack. How exactly does it eliminate the use of RBP register as a frame pointer? Well, the gist is that during compile time, the compiler kind of calculates the shift in the RSP needed for each instruction. 

It makes sense for the file size to increase if we're not using RSP, since for each instruction we're also storing the offset of RSP in the binary, BUT that's incorrect. If a instruction previously used `RBP - 8`, then it now uses, for example, `RSP + 16`. The calculation happens at compile time and the number of bytes used is _exactly_ the same! BUT we're _also_ eliminating parts of machine instruction which previously instructed it to save RBP etc. So the binary size actually decreases. However, optimizations come at a cost of making debugging difficult.

> Slight quirk! If you're using VLAs, use of RBP as a frame pointer becomes necessary. This is trivially since presence of VLAs abstains us from doing the computations at compile time. This is also one of the reasons why the modern standard doesn't require the frame pointer, but previous versions do, since VLAs aren't there in the modern standard.

> We'll explore how does the situation with frame pointer being substituted actually evolves in the section on assembly.

Now, let's figure out the final part of the puzzle. How does _returning_ work? If the return value the RAX register (or something similar) is used. First, the callee function writes out the value to the RAX register. Next, the callee's stack frame is popped and the RSP once again points to the Return Address of the caller. The return address is injected to RIP (holds the memory address of the next instruction) and the execution restarts, finishing the life cycle. 

> Terminology quirk! You must be confused _what_ is the return address. The return address is actually the address of the instruction which moves the RAX value back to where the function was to return to. It's not the memory address where the value is to be returned!

> RAX isn't the only register that's used, but you don't need to worry much about it yet, we'll probably cover it later if we need it.

> It is interesting to see, that _all_ the variables you define in Python exist on heap. Not only is this true for Python, it is sort of a limiation of truly interpreted languages. This is because as we mentioned earlier, the _real_ program is python.exe, or the python interpreter NOT your code, which serves as input to the interpreter. Thus, any variable you define "locally" in Python is not really local to the program itself. Hence, everything _must_ exist on the heap. This is not to say that you can't define a stack in Python (in fact, python itself creates a call stack with `PyFrameObject`s), but the "stack" must be _virtual_. In reality, the elements must be objects existing on the heap, linked together. 

### Delving into Assembly
If we compare Assembly to, say, something like C -- I would argue Assembly to be _simpler_ in the literal sense. Like Python is an abstraction of the concepts of C (such as memory management), C is an abstraction of Assembly. Of course, multiple steps exist between the conversion of a C program to the final compiled one, which is just machine code. In that sense, Assembly itself is an abstraction of machine code! And following the same chain of thought, I'd argue machine code to be _even_ simpler than Assembly. This argument, although technically valid fails to capture the difficulty of working with these bottom layers of programming. Simplicty -- often does not translate into ease of use, and this is even truer for the layers I just mentioned. 

When you write something in C, such as `int a = b + c`, you're relying on the compiler to find a way to _translate_ this into a language that your computer can understand. You are "requesting" the compiler to provide you with the logic which lets you achieve this. However, Assembly is fundamentally different. It's not about requesting logic, it's about dictating the flow of things, dictating movement and achieving control at one of the lowest level accessible to you as a user. Frankly speaking, in the previous section we *cough* abused *cough* the word "registers". Now is a good time, with sufficient context, to outright define a register. It is a tiny, super-fast storage location _within_ the CPU for immediate data, instructions and addresses required in computation. 

Essentially, registers in Assembly are like variables in C. We'll only be talking about the x86 assembly language, although there exist many different variations of assembly. In particular, we'll be using the AT&T syntax of the x86 assembly language since it is the one used by the GCC compiler, and almost everything we discuss will be with respect to GAS (assembler for GCC).

Although we won't be writing Assembly for our purposes, it's worthwhile to understand the general structure of it. Here's a piece of x86 assembly AT&T syntax code:
```assembly
	.text
	.globl	update_memory
	.type	update_memory, @function
update_memory:
.LFB0:
	pushq	%rbp
	movq	%rsp, %rbp
	movq	%rdi, -24(%rbp)
	movl	%esi, -28(%rbp)
	movq	-24(%rbp), %rax
	movl	(%rax), %eax
	movl	%eax, -4(%rbp)
	movl	-28(%rbp), %eax
	addl	%eax, -4(%rbp)
	movq	-24(%rbp), %rax
	movl	-4(%rbp), %edx
	movl	%edx, (%rax)
	nop
	popq	%rbp
	ret
.LFE0:
	.size	update_memory, .-update_memory
```

Let us try to figure out what this piece of code is actually doing. Firstly, some syntax. The assembler scans code line by line, and lines ending with `:` are classified as _labels_. The labels starting with `.` are _local labels_, which aren't inserted to the Symbol Table (recall the Symbol Table). If the line starts with a `.`  but doesn't end with a `:` the assembler checks if it's a _directive_ and then uses the appropriate instruction. Thus, in our code `.global`, `.text`, `.type`, `.size` are diretives, `update_memory` a label, and `LFB0`, `LFE0` local labels. The local labels serve as temporary scope jump targets (for example in loops), but serve no purpose outside the scope of a function. 

An instruction with a mnemonic such as `mov` is suffixed with a letter indicating the size of its operands. `q` implies 64 bits (qword), `l`  implies 32 bits (dword). In the order of operands, the source comes before the destination.   
> Although we said scanning occurs line by line, it doesn't have to be that way. In GAS specifically, we can treat either `\n` or `;` as a terminator character. However, the same is not true for NASM, where `;` is used for comment.  

We'll go line by line
- `.text` - Switches to code segment.
- `.globl update_memory` - Makes the function `update_memory` visible to other files (linking).
- `.type update_memory, @function` - Metadata, defines type of `update_memory`.
- `update_memory:` Signifies start of scope, and `LFB0` signifies start of function. 
- `pushq %rbp`: Push the previous functions RBP to the stack (as we saw earlier). Also `q` since the RBP is a 64 bit register.
- `movq %rsp %rbp`: Push the value of the current stack pointer to RBP.

Now a standard behaviour of an unoptimized compiler is to move all the arguments to the stack. The next two lines execute that behavior. The values from registers `rdi` and `esi` are being pushed to the stack. Notice one difference, `movq` for `rdi` and `movl` for `esi`. The first argument is thus $64$ bit, the second is $32$ bit.

> IMPORTANT: We are using copy and move interchangebly here, since mov is essentially copy. 

The parantheses `()` in assembly imply _"go to address inside_". Next steps are  
1. Putting the value stored at `rbp - 24` into `rax` (notice the redundancy, the pointer was already present in a register before!)
2. Going to the memory address inside `rax`, and copying it to `eax`.
3. Moving the value in `eax` to `rbp - 4`. This tells us that there is a local variable in the function, which holds the dereferenced value of the first argument, thus the first argument must be a pointer. Also, since the value it holds is $32$ bit, it can't be a pointer to a pointer. 
4. Moving value at `rbp - 28` to `eax`.
5. Adding value of `eax` _to_ `rbp - 4` (source vs destination). This implies that the value of the second argument is same as the type of value the first argument points to, and that the type is actually an integer since we're doing arithmetic. 

We'll just speed through the rest of the instructions, but essentially the pointer at `rbp - 24` is moved to `rax`, the local variable into `edx` and the value at `edx` is being copied into the _dereferenced_ `rax`. Thus, the function changes the value pointed at by the pointer. A "dumb" compiler would usually add another line to return the value if a value was to be returned, thus we can safely assume that the function returns no value.

It appears the actual program probably looks something like this:
```c
void update_memory(int *ptr, int val) {
    int temp = *ptr;    
    temp = temp + val;  
    *ptr = temp;
}
```
We can't really know the actual _names_ of the variables but we have figured out the overall structure! Also, none of the instructions were complicated at all, and following the chain of arguments we were able to figure out the code for something complicated like pointers. Assembly is indeed simple!


To see for yourself, save this code in a file (say `test.c`) and use `gcc -S -O0 test.c`. Try using the flag `-O1` instead of `-O0`, it compresses all of the above instructions to just,

```assembly 
update_memory:
.LFB0:
	addl	%esi, (%rdi)
	ret
.LFE0
```
Can you guess, why? The `-O0` setting is dumb, it doesn't apply any optimizations. However, `-O1` applies optimizations, and absolutely obiliterates the work by `-O0`. 

Almost everything we talked about in the previous section can be illustrated in assembly, here's some ideas for you to play around with:
1. Try writing a function which returns an `int`. Look at the register the final value is pushed in. Now, change it to `long long int`, and observe. (EAX vs RAX). 
2. Try writing a function which takes more than $6$ arguments. (Registers vs Stack)
3. Try writing a program which has initialized global variables, and uninitalized global variables. (.data, .bss)
4. Try out different optimization flags, you'll notice `rbp` disappear as optmizations are introduced.
5. Try writing programs which use structs, and programs which return structs. 

Remember when I said, assembly is just a step away from machine code? I meant it. Let us run `objdump` on our binary: `objdump -d a.out`. It'll output a bunch of stuff, which -- should make a lot of sense now? I hope so atleast! Scrolling to the section of `update_memory` you'll notice this

```dump 
0000000000001119 <update_memory>:
    1119:	55                   	push   %rbp
    111a:	48 89 e5             	mov    %rsp,%rbp
    111d:	48 89 7d e8          	mov    %rdi,-0x18(%rbp)
    1121:	89 75 e4             	mov    %esi,-0x1c(%rbp)
    1124:	48 8b 45 e8          	mov    -0x18(%rbp),%rax
    1128:	8b 00                	mov    (%rax),%eax
    112a:	89 45 fc             	mov    %eax,-0x4(%rbp)
    112d:	8b 45 e4             	mov    -0x1c(%rbp),%eax
    1130:	01 45 fc             	add    %eax,-0x4(%rbp)
    1133:	48 8b 45 e8          	mov    -0x18(%rbp),%rax
    1137:	8b 55 fc             	mov    -0x4(%rbp),%edx
    113a:	89 10                	mov    %edx,(%rax)
    113c:	90                   	nop
    113d:	5d                   	pop    %rbp
    113e:	c3                   	ret
```

The output has $3$ distinct columns. The first representing the address of the instruction, the second representing the machine code and the third is just the human-readable translation of the machine code. $1119$ is the entry point of the function `update_memory`, as you'll notice in line $1$. At $1119$ there's a single byte of instruction $55$. Thus, the next instruction starts at $111a$, which occupies $3$ bytes of instruction making the next instruction start at $111d$ (3 bytes difference).

If you look at the start of the dump, you'll notice it starts from `1000`. And the second column holds the hex representation of the instructions. As a programmer, we have hit BEDROCK! We _cannot_ go any lower than this. Thus, code is just an array of numbers. If you want to see _exactly_ the array of numbers, use the hexdump! Using the command `hexdump -C a.out | head -n 500` you can see a lot of hex stuff, and if you look at 1119, you'll see the exact instructions as we see here. (I have artificially added the first row for reference)

```
          0  1  2  3  4  5  6  7   8  9  a  b  c  d  e  f  
00001110  f3 0f 1e fa e9 67 ff ff  ff 55 48 89 e5 48 89 7d  |.....g...UH..H.}|
00001120  e8 89 75 e4 48 8b 45 e8  8b 00 89 45 fc 8b 45 e4  |..u.H.E....E..E.|
00001130  01 45 fc 48 8b 45 e8 8b  55 fc 89 10 90 5d c3 55  |.E.H.E..U....].U|
```


As you can see `55` exists at 1119, `48 89 e5` at a to c and so on. Pretty cool right? BEDROCK!  

> There's a lot more to say about the exact structure of the stuff between 0x0000 and 0x0FFF, and we will end up covering that in the next part. For now, you might want to search about ELF files. In the first row of hexdump, you might notice this `|.ELF............|`, and the _magic numbers_!

## Polymorphic Engines: Part 2 

Now that we confidently understand how a program is just a set of instructions or numbers or simply put -- data, that _lives_ in the memory, we should think about breaking this system. Well, it would be unfair to say "we are breaking it" since the system was built to be flexible. Like we can write, modify or delete contents of a file since it's just data, theoretically speaking, the same should be possible for programs too. However, there are certain roadblocks that the OS poses you with, which usually don't allow you to achieve this. 

The OS doesn't trust you!

In this section we'll learn to bypass these protections, in a certain way, _gaslight_ the OS into believing us? If that makes sense. Let us look at a naive attempt to achieve this goal, where we simply get the pointer to the start of the function, and cast it to an `unsigned char*` so as to treat it like a data array. 

```c 
#include <stdio.h>

void victim_function() {
    printf("I am running normally.\n");
}

int main() {
    unsigned char *code_ptr = (unsigned char *)victim_function;
    printf("Overwriting instructions...\n");

    *code_ptr = 0xCC; // Opcode for debug breakpoint 

    printf("Success! Code modified.\n");
    return 0;
}
```

Ofcourse, since it's accessing data that it's not supposed to, it'll give a Segmentation fault error. 
```
[sjais@sjais polymorphism]$ ./a.out 
Overwriting instructions...
Segmentation fault         (core dumped) ./a.out
```
If you dig deeper, and use `dmesg`, you'll see the following line in the logs, (I've replaced most of the information with `...` in favor of focusing on what we want to see). You'll notice it says `error 7`. This error is exactly the one for `write to a mapped area that isn't writeable`. [This](https://utcc.utoronto.ca/~cks/space/blog/linux/KernelSegfaultErrorCodes#:~:text=error%207%20:%20write%20to%20a,memory%20mapping%20that%20lacks%20PROT_WRITE%20.) link will lead you to other interesting error codes in segfault.

```
[...] a.out[75677]: segfault at ... --> error 7 <-- in a.out[...] likely on CPU 7 (core 12, socket 0)
```

> If you're interested in these errors for whatever reason, [here's](https://utcc.utoronto.ca/~cks/space/blog/linux/KernelSegfaultMessageMeaning) an article which discusses more about how these error codes are actually structured. 



If you remember the ELF/PE files we talked about earlier, now's their time to shine. If you thought that the few sections we earlier talked about are the _only_ sections inside them, then you -- my friend, are gravely mistaken. The ELF file doesn't just hold the code, there's a lot more information that's needed to be supplied to run programs on your CPU. It holds the permissions, the metadata and everything. You can look at the sections of any ELF binary using `readelf -S <binary>`. In our case, it outputs:
```
Section Headers:
  [Nr] Name              Type             Address           Offset
       Size              EntSize          Flags  Link  Info  Align
  ...
  [13] .text             PROGBITS         0000000000001040  00001040
       0000000000000155  0000000000000000  AX       0     0     16
  [15] .rodata           PROGBITS         0000000000002000  00002000
       0000000000000010  0000000000000000   A       0     0     4
  [25] .data             PROGBITS         0000000000004008  00003008
       0000000000000010  0000000000000000  WA       0     0     8
```

About the MMU we talked about earlier, the smallest unit that the MMU operates on (and the only unit it operates on) is a _page_. It cannot directly manage sections of memory smaller than a **Page** (usually 4KB, but it can be larger or smaller too). Thus, to change the permission of a specific part of the memory, we must change it for the _entire_ page. 

![image](https://hackmd.io/_uploads/SkC64daM-g.png)


Let us for now focus on the Flags column. The `.data` section is WA, i.e. Write/Allocate, whereas `.text` section is AX, i.e. Allocate/Execute, no writing allowed! Here's an updated version of a diagram we saw earlier. Memory can be writeable OR executable but usually not both. This is the specific rule we break to write Polymorphic Engines. Note that the code we write now, _WON'T_ work on Windows using MinGW but there are workarounds to it, and to wrtite the parallel code for Windows, you should look up the relevant APIs. 

> Operating Systems enforce a policy called $W \oplus X$, i.e. Writeable or Executable but never simultaneously. Without the $W \oplus X$ policy, an attacker could just write malicious code into a section that is $RWX$ (that is, Read, Write, Execute permission) and execute it, compromising the software. Although Linux provides a utility `mprotect` to make certain pages $RWX$, the same is not true for MacOS. There is a counter part of `mprotect` on Windows, in particular `VirtualProtect`.

To change permissions, we must use the `mprotect` (windows counterpart VirtualProtect) system API, which looks like:

```c 
int mprotect(void *addr, size_t len, int prot);
```
- `addr`: Address of page to be changed. Multiple of $4096$. 
- `len`: How much memory to change.
- `prot`: New permissions. Possible permissions are: PROT_READ, PROT_WRITE, PROT_EXEC and their combninations following $W \oplus X$. We want em all. 

Our goal when writing Polymorphic Engines specifically is _stealth_. If a virus contains byte sequence of a malicious code, then the antivirus can easily flag the file as a malware, and delete it. Using `mprotect` allows us to do something significant. We can encrypt our malicious code, which will make it complete garbage. We can then run our program, which will decrypt the garbage into actual malicious code, and then execute it. Our malicious code will _never_ be present on the disk, and hence go undetected. It will only exist in the RAM for a while, wreak havoc, and then *poof*, **vanished**. That's stealth, baby.

We'll write a simple program which does this. To do this, we must have our encrypted shellcode, a decryptor and contents of our main function. Inside the main function, we will do something to decrypt the contents, and run it. Let's get to business now.

If you're not on Linux OR you're using an ARM chip, you'll have to generate your own shell code, for this program to work. If you're on Linux, then this will work just fine (I'll later instruct how to generate the shellcode). 

```c
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>
#include <stdlib.h>

unsigned char encrypted_shellcode[] = {
    0xe2, 0x9b, 0x6a, 0xe2, 0x55, 0x6a, 0xe2, 0x23, 0x6d, 0xe2, 0x27, 0x9f, 
    0xbb, 0xaa, 0xaa, 0xaa, 0xe2, 0x9b, 0x78, 0x18, 0xa4, 0xa5, 0xaf, 0xe2, 
    0x9b, 0x6a, 0x1a, 0x96, 0xe2, 0x9b, 0x55, 0xa5, 0xaf, 0xe2, 0xcf, 0xc6, 
    0xc6, 0xc5, 0x86, 0x8a, 0xfd, 0xc5, 0xd8, 0xc6, 0xce, 0x8b, 0xa0, 
};
```
The code has been XOR encrypted using the `0xAA` key. The decryptor for the same can be written as follows:

```c
void decrypt(unsigned char *code, size_t len) {
    for (int i = 0; i < len; i++) {
        code[i] ^= 0xAA; 
    }
}
```

Now, we will start writing the contents of `main`. First, let us just request the MMU for a fresh page of memory, we'll do this by using the `mmap` API, where we will be injecting the payload. The `mmap` API has similar arguments as `mprotect`, with three more arguments:
- `flags`: Type of mapping, either `MAP_SHARED` or `MAP_PRIVATE`. We'll choose `MAP_PRIVATE`.
- `fd`: File descriptor of the file to map. We do not need one, thus use `-1`.
- `offset`: Again not required so `0`.

Moreover, setting the address to `NULL` just allocates memory wherever the MMU has available space. We'll also check if the memory allocation failed, if it did for whatever reason. Here's the code:

```c 
int main(){
    printf("[*] Press ENTER to start. \n");
    getchar(); // Just for the dramatic effect lol
        
    size_t len = sizeof(encrypted_shellcode); // Length of encrypted shellcode.
    
    // Allocate memory
    void *exec_mem = mmap(NULL, len, PROT_READ | PROT_WRITE, 
                          MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    
    if (exec_mem == MAP_FAILED) {
        perror("mmap"); // Error out if the mapping failed.
        exit(1);
    }
}
```
Next, we will copy the shellcode into the newly allocated memory, and decrypt the shellcode present in memory.
```c 
int main(){
    // ...
    
    // Copy the shellcode into the newly allocate memory.
    memcpy(exec_mem, encrypted_shellcode, len);

    // Decrypting the shellcode present in memory.
    printf("[*] Decrypting payload...\n");
    decrypt((unsigned char *)exec_mem, len); 
    
}
```
Now, we'll use `mprotect` to gain execute permission (we actually don't even need write permission simultaneously in this case, but we can take it if we want) for the memory page. Finally we'll execute the decrypted shellcode, and write some more code, which will actually never be executed _if_ our program runs perfectly. 

```c 
int main(){
    // ...
    
    printf("[*] Marking memory EXECUTE via mprotect...\n");
    
    // Run mprotect and error if it fails for whatever reason. 
    if (mprotect(exec_mem, 4096, PROT_READ | PROT_EXEC) == -1) {
        perror("mprotect");
        exit(1);
    }
    
    printf("[*] Jumping to payload...\n");
    printf("------------------------------------------------\n");
    
    // RUN IT!!
    void (*func)() = (void (*)())exec_mem;
    func();
    
    printf("You will never see this.\n");

    return 0;
}
```

If you're on Linux (as we mentioned before), you'll see the following output in your console upon execution:

```
[sjais@sjais polymorphism]$ ./a.out 
[*] Press ENTER to start. 

[*] Decrypting payload...
[*] Marking memory EXECUTE via mprotect...
[*] Jumping to payload...
------------------------------------------------
Hello, World!
```

BUT BUT BUT before you run it, shouldn't you check whether I'm just bluffing and that piece of encrypted shell code is an _actual_ malware? Earlier, if you had the will, now you ALSO have the skills to reverse engineer that piece of code, and check it for yourself. Awesome, right?

> You might think that if $RWX$ is such a big security risk, then why do Windows and Linux allow it (there's something even more confsing you'll see later)? The reason is JIT compilers (basically your web browser) require $RWX$. Another question you might pose is, if MacOS doesn't allow $RWX$ at all, then how do web browsers function on MacOS? A program which requires $RWX$ on MacOS must create a _pseudo_ $RWX$ situation, in which it constantly jiggles back and forth between $WA$ and $AX$ (as we did in our code). Hilarious right? Moreover, not every program is allowed to do this, instead your program must be _signed_ by Apple to be allowed to use JIT. Crazy stuff.

> ANOTHER question you might pose is, if the OS just hands out RWX permission like anything, does it not want to defend itself from malicious code? The answer is pretty out of scope of this article, and even I am not sure how it works :(. But it appears there are multiple layers of defense against the kind of malware. 

## Security Vulnerabilities

### Buffer Overflows
> https://www.youtube.com/watch?v=C630ttQlyhI
> https://blogs.oracle.com/linux/unwinding-stack-frame-pointers-and-orc



Author: Shivansh Jaiswal (+91 9971104638)
---
