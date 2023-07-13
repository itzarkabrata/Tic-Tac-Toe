def printBoard(board):#used to print the current state of the board
    print("Here is the current state of the Board\n\n")
    for i in range(0,9):
        if(i>0 and i%3==0):#used to print only 3 sections of a board in each row
            print("\n")
        if(board[i]==0):
            print("_ ",end=" ") # blank space is stated as _
        elif(board[i]==1):
            print("O ",end=" ") #user will put O
        else:
            print("X ",end=" ") #computer will put X
    print("\n\n")

def player1Turn(board):
    success = 0
    while success==0:
        pos = int(input("Where do you want to put 'X' [1,2,3....9] : "))
        if(board[pos-1]==0):
            board[pos-1]=-1 #user only put X and X is represeted as -1
            success = 1
        else:
            print("\nWRONG MOVE!!!!!\n\n")

def player2Turn(board):
    success = 0
    while success==0:
        pos = int(input("Where do you want to put 'O' [1,2,3....9] : "))
        if(board[pos-1]==0):
            board[pos-1]=1
    # in multiplayer computer is replaced by a player and as computer only put O and O is represented by 1
            success = 1
        else:
            print("\nWRONG MOVE!!!!!\n\n")
            
def minmax(board,player): #player represents that now which symbol(O/X) is going to put on board
    x = analyseBoard(board)
    if(x!=0):
        return (x*player)
    pos = -1
    value = -2
    for i in range(0,9):
        if(board[i]==0):
            board[i]=player
            score =-minmax(board,player*-1) # player*-1 represents the next symbol going to put on board
            board[i]=0 #backtracking
            if(score>value):
                value = score
                pos = i
    if(pos==-1):
        return 0
    return value

def compTurn(board):
    pos = -1 # as initially the computer does not know where to put the O
    value = -2
    for i in range(0,9):
        if(board[i]==0):
            board[i]=1
            score =-minmax(board,-1); # -1 represents the next turn i.e the user turn
            board[i]=0 #Backtracking
            if(score>value):
                value = score
                pos = i
    board[pos]=1
    
def analyseBoard(board):
    match = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

    '''a win occurs only when all the content in a single row or column or diagonal of a board are same.
        So all the sub-lists in match represents the indexes of all rows,columns and diagonals'''
    for i in range(0,8):
        if(board[match[i][0]]!=0 and board[match[i][0]]==board[match[i][1]] and board[match[i][0]]==board[match[i][2]]):
            return board[match[i][0]] # in matched row,col,diagonal ; returns the first element of board
    return 0

def main():
    choice = int(input("Enter 1 for 'Single-Player' and 2 for 'Multi-Player'"))
    board = [0,0,0,0,0,0,0,0,0] #this is the tic-tac-toe board
    if(choice==1):
        name = input("Enter player name : ")
        print("\nGAME BEGINS...........between\n\nCOMPUTER-->O & {}-->X".format(name))
        player = int(input("Whether you opt for 1(first chance) or 2(second chance)"))
        for step in range(0,9):
            if(analyseBoard(board)!=0):
                break
            if((step+player)%2==0): # used to identify wether its computer chance or player chance
                printBoard(board)
                compTurn(board)
            else:
                printBoard(board)
                player1Turn(board)
        result = analyseBoard(board)
        if(result==0):
            print("\n\nIts an DRAW!!!!!!!")
        elif(result==1):
            printBoard(board)
            print("\n\nComputer Wins the GAME")
        else:
            print("\n\nPlayer--->{} Wins the GAME".format(name))
    else:
        name1 = input("Enter player1 name(Got-X): ")
        name2 = input("Enter player2 name(Got-O) : ")
        print("\nGAME BEGINS...........between\n\n{}-->X & {}-->O".format(name1,name2))
        for step in range(0,9):
            if(analyseBoard(board)!=0):
                break
            if(step%2==0):
                printBoard(board)
                player1Turn(board)
            else:
                printBoard(board)
                player2Turn(board)
        result = analyseBoard(board)
        if(result==0):
            print("\n\nIts a DRAW!!!!!!!")
        elif(result==1):
            printBoard(board)
            print("\n\nplayer2--->{} Wins the GAME".format(name2))
        else:
            printBoard(board)
            print("\n\nPlayer1--->{} Wins the GAME".format(name1))
            
            
'''In this game Winning of user is represented by -1
                 Winning of computer is represented by 1
                 Draw match is represented by 0'''           
            
    

start = input("Are tou ready to start the game??(yes/no)")
if(start=="yes" or start=="y"):
    main()
else:
    print("Okey! No issue. Have a great day")
