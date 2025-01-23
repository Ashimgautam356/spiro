


const NavBar = () => {
  return (
    <div className="w-screen flex flex-row  justify-between items-center h-[6vh] border border-1 solid red">
        <div className="flex flex-row ">
            <a href="men">MEN</a>
            <a href="women">WOMEN</a>
            <a href="all">All</a>
        </div>
        <div>
            <p>SPIRO</p>
        </div>
        <div>
            <span className="material-icon-cart">asdf</span>
        </div>
    </div>
  )
}

export default NavBar