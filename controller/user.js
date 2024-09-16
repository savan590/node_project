const { getRepository, ILike } = require("typeorm");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const dotenv = require('dotenv')
dotenv.config()

exports.register = async (req, res) => {
    const { name, email, password, role, phone, city, country } = req.body;

    const userRepository = getRepository(User);

    if (!name || !email || !password || !role || !phone || !city || !country) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const validateNonNumeric = (value) => {
        return !/\d/.test(value);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{4,}$/;;
        return passwordRegex.test(password);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validRoles = ["Admin", "Staff"];

    if (!validateEmail(email)) {
        return res.status(406).json({ success: false, message: "Invalid email address." });
    }

    // Check if the email already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ success: false, message: "Email already exists." });
    }

    if (!validatePassword(password)) {
        return res.status(406).json({ success: false, message: "Password must be at least 4 characters long, and contain at least one uppercase letter, one lowercase letter, and one number." });
    }
    if (!validRoles.includes(role)) {
        return res.status(406).json({ success: false, message: "Role must be either 'Admin' or 'Staff'." });
    }

    if (phone && !validatePhone(phone)) {
        return res.status(406).json({ success: false, message: "Invalid phone number. Must be exactly 10 digits." });
    }

    if (city && !validateNonNumeric(city)) {
        return res.status(406).json({ success: false, message: "City should not contain numbers." });
    }

    if (name && !validateNonNumeric(name)) {
        return res.status(406).json({ success: false, message: "Name should not contain numbers." });
    }

    if (country && !validateNonNumeric(country)) {
        return res.status(406).json({ success: false, message: "Country should not contain numbers." });
    }


    let hashpassword = await bcrypt.hash(password, 10);
    const user = {
        name,
        email,
        password: hashpassword,
        role,
        phone,
        city,
        country,
    };

    try {
        await userRepository.save(user);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    try {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.SECRET_KEY);

        res.json({ message: "User login successfully", token: token });
    } catch (error) {
        console.error("Error while login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.listUsers = async (req, res) => {
    try {
        const userRepository = getRepository(User);

        const { search, filter } = req.query;

        let whereConditions = [];

        if (search) {
            whereConditions.push(
                { name: ILike(`%${search}%`) },
                { email: ILike(`%${search}%`) }
            );
        }

        if (filter) {
            whereConditions.push({ country: ILike(`%${filter}%`) });
        }

        const users = await userRepository.find({
            where: whereConditions
        });

        // Filter results to meet both search and filter criteria
        const filteredUsers = users.filter(user => {
            const matchesSearch = search ? (user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase())) : true;
            const matchesFilter = filter ? user.country.toLowerCase().includes(filter.toLowerCase()) : true;
            return matchesSearch && matchesFilter;
        });

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error });
    }
};

exports.getUserDetails = async (req, res) => {
    const { userId } = req.params;
    const currentUser = req.user;

    try {
        const userRepository = getRepository(User);

        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (currentUser.role !== "Admin" && currentUser.userId !== user.id) {
            return res.status(403).json({ message: "You can only access your own details" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Error fetching user details", error });
    }
};


