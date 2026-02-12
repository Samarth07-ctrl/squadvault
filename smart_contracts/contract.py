from pyteal import *

def approval_program():
    # Global State Keys
    Creator = Bytes("Creator")
    PoolName = Bytes("PoolName")
    ContributionAmount = Bytes("ContributionAmount")
    TotalFunds = Bytes("TotalFunds")
    
    # Local State Keys
    HasPaid = Bytes("HasPaid")
    AmountPaid = Bytes("AmountPaid")

    # Operations
    op_pay = Bytes("pay")
    op_withdraw = Bytes("withdraw")

    # 1. Handle Creation
    # Initializes the pool with a name and contribution amount
    # Args: [PoolName, ContributionAmount]
    handle_creation = Seq([
        App.globalPut(Creator, Txn.sender()),
        App.globalPut(PoolName, Txn.application_args[0]),
        App.globalPut(ContributionAmount, Btoi(Txn.application_args[1])),
        App.globalPut(TotalFunds, Int(0)),
        Return(Int(1))
    ])

    # 2. Handle OptIn (Join Pool)
    # Users must opt-in to track their payment status
    handle_optin = Seq([
        App.localPut(Txn.sender(), HasPaid, Int(0)),
        App.localPut(Txn.sender(), AmountPaid, Int(0)),
        Return(Int(1))
    ])

    # 3. Handle Payment (Contribution)
    # User sends ALGO to the contract account
    # Requires a Payment Transaction (Gtxn[1]) to accompany this App Call (Gtxn[0])
    # The payment receiver must be the Global CurrentApplicationAddress
    payment_amount = Gtxn[1].amount()
    payment_receiver = Gtxn[1].receiver()
    
    pay_contribution = Seq([
        # Verify group size is 2 (App Call + Payment)
        Assert(Global.group_size() == Int(2)),
        
        # Verify payment is to this contract
        Assert(payment_receiver == Global.current_application_address()),
        
        # Update User's Local State
        App.localPut(Txn.sender(), AmountPaid, App.localGet(Txn.sender(), AmountPaid) + payment_amount),
        
        # Check if they have met the contribution requirement
        If(App.localGet(Txn.sender(), AmountPaid) >= App.globalGet(ContributionAmount))
        .Then(App.localPut(Txn.sender(), HasPaid, Int(1))),
        
        # Update Global Total Funds
        App.globalPut(TotalFunds, App.globalGet(TotalFunds) + payment_amount),
        
        Return(Int(1))
    ])

    # 4. Handle Withdraw
    # Only the Creator can withdraw funds
    # Args: [Amount]
    withdraw_amount = Btoi(Txn.application_args[1])
    
    withdraw_funds = Seq([
        # Verify sender is Creator
        Assert(Txn.sender() == App.globalGet(Creator)),
        
        # Verify contract has enough funds
        Assert(Balance(Global.current_application_address()) >= withdraw_amount),
        
        # Send Payment to Creator
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.sender(),
            TxnField.amount: withdraw_amount,
            TxnField.fee: Int(0) # Inner txn fee pooling
        }),
        InnerTxnBuilder.Submit(),
        
        # Update Total Funds tracking
        App.globalPut(TotalFunds, App.globalGet(TotalFunds) - withdraw_amount),
        
        Return(Int(1))
    ])

    # Routing
    handle_noop = Cond(
        [Txn.application_args[0] == op_pay, pay_contribution],
        [Txn.application_args[0] == op_withdraw, withdraw_funds]
    )

    handle_closeout = Return(Int(1)) 
    handle_update = Return(Int(0)) # Disallow updates for security
    handle_delete = Return(Int(0)) # Disallow deletion for security

    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.CloseOut, handle_closeout],
        [Txn.on_completion() == OnComplete.UpdateApplication, handle_update],
        [Txn.on_completion() == OnComplete.DeleteApplication, handle_delete],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop]
    )

    return compileTeal(program, Mode.Application, version=6)

def clear_state_program():
    program = Return(Int(1))
    return compileTeal(program, Mode.Application, version=6)

if __name__ == "__main__":
    with open("approval.teal", "w") as f:
        f.write(approval_program())
    with open("clear_state.teal", "w") as f:
        f.write(clear_state_program())
